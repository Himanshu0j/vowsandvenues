const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Desktop Viewport (1440 x 900)
  console.log('Setting viewport 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  
  console.log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // Take Desktop Viewport Screenshot BEFORE scroll
  const desktopViewportPath = path.join(ARTIFACT_DIR, 'new_desktop_viewport_1440x900.png');
  await page.screenshot({ path: desktopViewportPath, fullPage: false });
  console.log('Saved:', desktopViewportPath);

  // Smooth scroll down to bottom and back up to trigger any intersection observers
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 500;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  await new Promise(r => setTimeout(r, 4000));

  // Take Desktop Full Page Screenshot
  const desktopFullPath = path.join(ARTIFACT_DIR, 'new_desktop_fullpage.png');
  await page.screenshot({ path: desktopFullPath, fullPage: true });
  console.log('Saved:', desktopFullPath);

  // DOM Inspection
  const domInspection = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('main > div > section, main > div > div')).map(el => {
      const rect = el.getBoundingClientRect();
      const headings = Array.from(el.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim());
      const images = Array.from(el.querySelectorAll('img')).map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }));
      return {
        className: el.className,
        headings,
        imageCount: images.length,
        brokenImages: images.filter(img => !img.complete || img.naturalWidth === 0).length
      };
    });

    const allImages = Array.from(document.querySelectorAll('img'));
    const totalBroken = allImages.filter(img => !img.complete || img.naturalWidth === 0).length;

    return {
      title: document.title,
      totalHeight: document.body.scrollHeight,
      totalImagesOnPage: allImages.length,
      totalBrokenImages: totalBroken,
      sections
    };
  });
  console.log('DOM Inspection:', JSON.stringify(domInspection, null, 2));

  // 2. Mobile Viewport (390 x 844)
  console.log('Setting viewport 390x844...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  const mobileViewportPath = path.join(ARTIFACT_DIR, 'new_mobile_viewport_390x844.png');
  await page.screenshot({ path: mobileViewportPath, fullPage: false });
  console.log('Saved:', mobileViewportPath);

  // Smooth scroll on mobile
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 400;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  await new Promise(r => setTimeout(r, 3000));

  const mobileFullPath = path.join(ARTIFACT_DIR, 'new_mobile_fullpage.png');
  await page.screenshot({ path: mobileFullPath, fullPage: true });
  console.log('Saved:', mobileFullPath);

  await browser.close();
  console.log('Completed capture successfully!');
}

run().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
