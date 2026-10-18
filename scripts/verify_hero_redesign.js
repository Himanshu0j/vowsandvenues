const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = process.env.TARGET_URL || 'https://vowsandvenues-staging.onrender.com';

const VIEWPORTS = [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920];

async function verify() {
  console.log('=== VOWS & VENUES: HERO REDESIGN ACCEPTANCE & VISUAL VERIFICATION ===');
  console.log(`Target: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Capture 1440x900 Desktop After Screenshot (First Viewport)
  console.log('1. Capturing Desktop 1440x900 First Viewport...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: `${ARTIFACT_DIR}/after_hero_1440x900.png`,
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });
  console.log(`✓ Saved ${ARTIFACT_DIR}/after_hero_1440x900.png`);

  // 2. Capture 390x844 Mobile After Screenshot (First Viewport)
  console.log('2. Capturing Mobile 390x844 First Viewport...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: `${ARTIFACT_DIR}/after_hero_390x844.png`,
    clip: { x: 0, y: 0, width: 390, height: 844 }
  });
  console.log(`✓ Saved ${ARTIFACT_DIR}/after_hero_390x844.png`);

  // 3. Responsive Overflow Audit across all 13 requested viewports
  console.log('\n3. Responsive Horizontal Overflow Audit (13 Viewports)...');
  const overflowResults = [];
  for (const width of VIEWPORTS) {
    await page.setViewport({ width, height: 900, isMobile: width < 768 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const overflow = await page.evaluate(() => {
      const docEl = document.documentElement;
      return {
        scrollWidth: docEl.scrollWidth,
        clientWidth: docEl.clientWidth,
        hasOverflow: docEl.scrollWidth > docEl.clientWidth + 1
      };
    });
    const pass = !overflow.hasOverflow;
    overflowResults.push({ width, ...overflow, pass });
    console.log(`   [${pass ? '✓ PASS' : '✗ FAIL'}] ${width}px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
  }

  // 4. Broken Image Audit
  console.log('\n4. Image Audit on Homepage...');
  const imageAudit = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    const broken = images.filter(img => img.complete && img.naturalWidth === 0);
    return {
      total: images.length,
      brokenCount: broken.length,
      brokenSrcs: broken.map(img => img.src)
    };
  });
  console.log(`   Total images found: ${imageAudit.total}, Broken: ${imageAudit.brokenCount}`);
  if (imageAudit.brokenCount > 0) {
    console.log('   Broken images:', imageAudit.brokenSrcs);
  } else {
    console.log('   ✓ 0 broken images detected');
  }

  // 5. Interactive Controls & CTAs Check
  console.log('\n5. Interactive CTA & Search Check...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Check headline text
  const headline = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : '';
  });
  console.log(`   Headline text: "${headline}"`);

  // Check Explore button
  const exploreBtnExists = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.innerText.includes('Explore Venues'));
  });
  console.log(`   Explore Venues CTA exists: ${exploreBtnExists ? '✓ YES' : '✗ NO'}`);

  // Check Search Venues button
  const searchBtnExists = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.innerText.includes('Search Venues'));
  });
  console.log(`   Search Venues CTA exists: ${searchBtnExists ? '✓ YES' : '✗ NO'}`);

  await browser.close();
  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
