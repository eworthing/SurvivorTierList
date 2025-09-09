const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const url = process.env.SMOKE_URL || 'http://localhost:5173/';
  console.log('Debug smoke starting against', url);
  try {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const page = await context.newPage();

    const logs = [];
    page.on('console', msg => logs.push({ type: 'console', text: msg.text(), location: msg.location() }));
    page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('#root', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const outDir = './tools/smoke-results';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(`${outDir}/console-log.json`, JSON.stringify(logs, null, 2));

    await page.screenshot({ path: `${outDir}/smoke-debug-full.png`, fullPage: true });
    const mainHandle = await page.$('div.max-w-7xl');
    if (mainHandle) await mainHandle.screenshot({ path: `${outDir}/smoke-debug-main.png` });

    await browser.close();
    console.log('Debug smoke finished; logs written to', `${outDir}/console-log.json`);
    process.exit(0);
  } catch (err) {
    console.error('Debug smoke failed', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
