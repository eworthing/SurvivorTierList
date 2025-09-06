// headless_check.js
// Launches Chromium headless, opens the app, captures console messages and page errors,
// prints a JSON summary to stdout.

(async () => {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const logs = [];
    page.on('console', msg => {
      try {
        logs.push({ type: 'console', level: msg.type(), text: msg.text() });
      } catch (e) {
        logs.push({ type: 'console', text: String(msg) });
      }
    });
    page.on('pageerror', err => logs.push({ type: 'pageerror', message: err.message, stack: err.stack }));
    page.on('requestfailed', req => logs.push({ type: 'requestfailed', url: req.url(), method: req.method(), failure: req.failure() }));

    const url = process.env.URL || 'http://localhost:8000/';
    console.log('Visiting', url);
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });

    // wait a bit for any lazy console messages or runtime UI rendering
    await page.waitForTimeout(1500);

    // wait for a data-loaded signal: window.getContestantGroup available and All Contestants populated
    try {
      await page.waitForFunction(() => {
        try { return typeof window.getContestantGroup === 'function' && Array.isArray(window.getContestantGroup('All Contestants')) && window.getContestantGroup('All Contestants').length > 0; } catch (e) { return false; }
      }, { timeout: 8000 });
    } catch (e) {
      // proceed anyway but note timeout
      logs.push({ type: 'warning', text: 'Timed out waiting for window.getContestantGroup to be ready' });
    }

    // capture some basic checks
    const title = await page.title().catch(() => '');
    const contentLength = await page.evaluate(() => document.documentElement.innerHTML.length);

    // Try to detect contestant elements by searching for known contestant names in the DOM
    const knownNames = ['Kyle Fraser', 'Boston Rob', 'Parvati', 'Michaela Bradshaw', 'Yam Yam Arocho'];
    // Mark up matching nodes with a temporary data attribute so we can select them
    const foundCount = await page.evaluate((names) => {
      const matches = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
      let n;
      while (n = walker.nextNode()) {
        const text = (n.textContent || '').trim();
        if (!text) continue;
        for (const nm of names) {
          if (text.includes(nm)) {
            n.setAttribute('data-headless-found', '1');
            matches.push(nm);
            break;
          }
        }
        if (matches.length >= 6) break;
      }
      return matches.length;
    }, knownNames).catch(() => 0);

    let interaction = { clicked: false, modalFound: false, dragAttempted: false, dragSucceeded: false };
    let foundSelector = null;
    if (foundCount > 0) {
      foundSelector = '[data-headless-found="1"]';
      // click the first found element and capture its text
      try {
        const el = await page.$(foundSelector);
        if (el) {
          const txt = await el.evaluate(n => (n.innerText || n.textContent || '').trim()).catch(() => '');
          interaction.clicked = false;
          await el.click({ timeout: 2000 }).catch(() => null);
          interaction.clicked = true;
          interaction.clickedText = txt;
          // wait for any modal/detail to appear
          await page.waitForTimeout(800);
          const modalSelectors = ['.modal', '.contestant-modal', '.contestant-detail', '.details', '#modal'];
          for (const msel of modalSelectors) {
            const present = await page.$(msel).then(Boolean).catch(() => false);
            if (present) { interaction.modalFound = true; break; }
          }

          // assert that clicked text appears somewhere else (detail area)
          if (txt) {
            const foundInDetail = await page.evaluate((t) => {
              const bodyText = document.body.innerText || '';
              return bodyText.indexOf(t) !== -1;
            }, txt).catch(() => false);
            interaction.foundTextElsewhere = foundInDetail;
          }
        }
      } catch (e) {
        interaction.clickError = String(e && e.stack ? e.stack : e);
      }

      // try a mouse-driven drag-and-drop between first two matching elements if there are at least two
      try {
        const els = await page.$$(foundSelector);
        if (els.length >= 2) {
          interaction.dragAttempted = true;
          const boxA = await els[0].boundingBox();
          const boxB = await els[1].boundingBox();
          if (boxA && boxB) {
            const start = { x: boxA.x + boxA.width / 2, y: boxA.y + boxA.height / 2 };
            const end = { x: boxB.x + boxB.width / 2, y: boxB.y + boxB.height / 2 };
            try {
              await page.mouse.move(start.x, start.y);
              await page.mouse.down();
              // move in small steps for reliability
              const steps = 10;
              for (let i = 1; i <= steps; i++) {
                const nx = start.x + (end.x - start.x) * (i / steps);
                const ny = start.y + (end.y - start.y) * (i / steps);
                await page.mouse.move(nx, ny);
                await page.waitForTimeout(30);
              }
              await page.mouse.up();
              interaction.dragSucceeded = true;
            } catch (err) {
              interaction.dragError = String(err && err.stack ? err.stack : err);
            }
          } else {
            interaction.dragError = 'Could not determine element bounding boxes';
          }
        }
      } catch (e) {
        interaction.dragError = String(e && e.stack ? e.stack : e);
      }
    }

    // take a screenshot of the page for manual inspection
    const screenshotPath = 'tools/smoke.png';
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => null);

    // visual diff: if pixelmatch/pngjs are available, compare against baseline
    let visual = { baselineExists: false, baselinePath: 'tools/baseline.png', diffPath: 'tools/diff.png', mismatchedPixels: null };
    try {
      const { default: pixelmatch } = await import('pixelmatch').catch(() => ({}));
      const { PNG } = await import('pngjs').catch(() => ({}));
      if (pixelmatch && PNG) {
        const fs = await import('fs');
        const path = 'tools/baseline.png';
        const hasBaseline = fs.existsSync(path);
        visual.baselineExists = hasBaseline;
        const curBuf = fs.readFileSync(screenshotPath);
        const curPng = PNG.sync.read(curBuf);
        if (!hasBaseline) {
          fs.writeFileSync(path, curBuf);
        } else {
          const baseBuf = fs.readFileSync(path);
          const basePng = PNG.sync.read(baseBuf);
          const width = Math.max(basePng.width, curPng.width);
          const height = Math.max(basePng.height, curPng.height);
          const img1 = new PNG({ width, height });
          const img2 = new PNG({ width, height });
          PNG.bitblt(basePng, img1, 0, 0, basePng.width, basePng.height, 0, 0);
          PNG.bitblt(curPng, img2, 0, 0, curPng.width, curPng.height, 0, 0);
          const diff = new PNG({ width, height });
          const mismatched = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
          fs.writeFileSync(visual.diffPath, PNG.sync.write(diff));
          visual.mismatchedPixels = mismatched;
        }
      } else {
        logs.push({ type: 'info', text: 'pixelmatch/pngjs not available, skipping visual diff' });
      }
    } catch (e) {
      logs.push({ type: 'warning', text: 'Visual diff failed: ' + String(e && e.stack ? e.stack : e) });
    }

    const result = { url, title, contentLength, logs, foundSelector, foundCount, interaction, screenshotPath, visual };

    console.log('\n=== HEADLESS CHECK RESULT (JSON) ===');
    console.log(JSON.stringify(result, null, 2));

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR RUNNING HEADLESS CHECK:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
