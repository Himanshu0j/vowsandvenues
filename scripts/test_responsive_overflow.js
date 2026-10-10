const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

const VIEWPORTS = [
  { width: 320, height: 568, name: '320px (iPhone SE)' },
  { width: 360, height: 740, name: '360px (Galaxy S8)' },
  { width: 375, height: 667, name: '375px (iPhone 8/SE2)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14)' },
  { width: 412, height: 915, name: '412px (Pixel 7)' },
  { width: 430, height: 932, name: '430px (iPhone 14 Pro Max)' },
  { width: 768, height: 1024, name: '768px (iPad Mini)' },
  { width: 1024, height: 768, name: '1024px (iPad Pro)' },
  { width: 1366, height: 768, name: '1366px (Laptop)' },
  { width: 1440, height: 900, name: '1440px (Desktop)' },
  { width: 1920, height: 1080, name: '1920px (FHD Desktop)' }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  console.log('Testing horizontal overflow & viewport health across', VIEWPORTS.length, 'sizes...');

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    const metrics = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      const bodyScrollW = document.body.scrollWidth;
      
      // Find any element causing overflow
      const overflowingElements = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const rect = el.getBoundingClientRect();
        if (rect.right > clientW + 1) {
          overflowingElements.push({
            tag: el.tagName,
            className: (el.className || '').toString().slice(0, 50),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
          if (overflowingElements.length >= 5) break;
        }
      }

      return {
        clientW,
        scrollW,
        bodyScrollW,
        hasOverflow: scrollW > clientW,
        overflowDelta: scrollW - clientW,
        overflowingElements
      };
    });

    const status = metrics.hasOverflow ? `❌ OVERFLOW (+${metrics.overflowDelta}px)` : '✓ OK (0px overflow)';
    console.log(`[${vp.name}] ${status}`);
    if (metrics.hasOverflow && metrics.overflowingElements.length > 0) {
      console.log('  Offending elements:', JSON.stringify(metrics.overflowingElements));
    }
  }

  await browser.close();
})();
