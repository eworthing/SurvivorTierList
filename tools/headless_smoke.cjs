const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const url = process.env.SMOKE_URL || 'http://localhost:5173/';
  console.log('Smoke test starting against', url);
  try {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A5341f Safari/604.1' });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    // wait for root to render
    await page.waitForSelector('#root', { timeout: 10000 });
    // small pause to allow client JS to hydrate
    await page.waitForTimeout(800);

    // create output dir
    const outDir = './tools/smoke-results';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const fullPath = `${outDir}/smoke-full.png`;
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log('Saved', fullPath);

    const mainPath = `${outDir}/smoke-main.png`;
    const mainHandle = await page.$('div.max-w-7xl');
    if (mainHandle) {
      await mainHandle.screenshot({ path: mainPath });
      console.log('Saved', mainPath);
    } else {
      console.warn('Main container selector not found; saved only full-page screenshot');
    }

    await browser.close();
    console.log('SMOKE: PASS');
    process.exit(0);
  } catch (err) {
    console.error('SMOKE: FAIL', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
