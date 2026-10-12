const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

const VIEWPORTS = [
  { name: '320x568_iPhoneSE', width: 320, height: 568 },
  { name: '360x740_GalaxyS8', width: 360, height: 740 },
  { name: '375x667_iPhone8', width: 375, height: 667 },
  { name: '390x844_iPhone12', width: 390, height: 844 },
  { name: '412x915_Pixel7', width: 412, height: 915 },
  { name: '430x932_iPhone14ProMax', width: 430, height: 932 },
  { name: '768x1024_iPadMini', width: 768, height: 1024 }
];

async function auditMobile() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    console.log(`Auditing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));

    // 1. Top of page
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_${vp.name}_top.png`) });

    // 2. Middle of page
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((h) => window.scrollTo(0, Math.floor(h * 0.45)), totalHeight);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_${vp.name}_mid.png`) });

    // 3. Bottom of page
    await page.evaluate((h) => window.scrollTo(0, h), totalHeight);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_${vp.name}_bottom.png`) });
  }

  // 4. Test Mobile Menu Open (at 390x844)
  console.log('Testing Mobile Menu Open at 390x844...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));

  // Look for hamburger menu button
  const menuBtn = await page.$('button[aria-label*="menu" i], button[title*="menu" i], nav button:has(svg.lucide-menu)');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_390x844_menu_open.png`) });
    console.log('Mobile menu open captured.');
  } else {
    // try clicking any hamburger icon
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('header button:last-child') || document.querySelector('nav button:last-child');
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (clicked) {
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_390x844_menu_open.png`) });
    }
  }

  // 5. Test Negotiation Drawer Open at mobile (390x844)
  console.log('Testing Negotiation Drawer Open at 390x844...');
  await page.evaluate(() => window.scrollTo(0, 0));
  const negBtn = await page.$('button[title*="Negotiate"]');
  if (negBtn) {
    await negBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `mobile_390x844_negotiation_open.png`) });
    console.log('Mobile negotiation drawer captured.');
  }

  await browser.close();
  console.log('Mobile audit complete.');
}

auditMobile().catch(console.error);
