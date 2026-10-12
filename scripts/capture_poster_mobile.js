const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: '375x667_iPhone8', width: 375, height: 667 },
    { name: '390x844_iPhone12', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    
    console.log(`Navigating for viewport ${vp.name}...`);
    await page.goto('https://vowsandvenues-staging.onrender.com/', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll directly to Rambagh poster
    await page.evaluate(() => {
      const poster = document.querySelector('img[alt*="Rambagh"]');
      if (poster) {
        poster.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await new Promise(r => setTimeout(r, 1500));

    // Get metrics
    const metrics = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="Rambagh"]');
      const container = img ? img.closest('div.relative') : null;
      const section = img ? img.closest('section') : null;
      return {
        windowWidth: window.innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        imgRect: img ? img.getBoundingClientRect() : null,
        containerRect: container ? container.getBoundingClientRect() : null
      };
    });

    console.log(`Metrics for ${vp.name}:`, JSON.stringify(metrics, null, 2));

    // Screenshot of viewport
    const vpShotPath = path.join(ARTIFACTS_DIR, `scene2_viewport_${vp.name}.png`);
    await page.screenshot({ path: vpShotPath, fullPage: false });
    console.log(`Saved: ${vpShotPath}`);

    // Screenshot of the poster element
    const posterEl = await page.$('img[alt*="Rambagh"]');
    if (posterEl) {
      const parentCard = await page.evaluateHandle(el => el.closest('.lg\\:col-span-7') || el.parentElement, posterEl);
      const cardShotPath = path.join(ARTIFACTS_DIR, `scene2_poster_card_${vp.name}.png`);
      await parentCard.screenshot({ path: cardShotPath });
      console.log(`Saved poster card: ${cardShotPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('Capture complete!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
