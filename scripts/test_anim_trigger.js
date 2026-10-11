const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function testAnimationTrigger() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check state of elements at the bottom before scrolling down
  const initialBottomElements = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    return headings.map(h => {
      const rect = h.getBoundingClientRect();
      const parent = h.closest('[style*="opacity"], [style*="transform"]') || h;
      const style = window.getComputedStyle(parent);
      return {
        text: h.innerText.slice(0, 30),
        top: Math.round(rect.top),
        opacity: style.opacity,
        transform: style.transform
      };
    });
  });

  console.log('Headings before scroll:');
  console.log(JSON.stringify(initialBottomElements, null, 2));

  // Now scroll to 2000px
  await page.evaluate(() => window.scrollTo(0, 2000));
  await new Promise(r => setTimeout(r, 600));

  const afterScrollElements = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    return headings.map(h => {
      const rect = h.getBoundingClientRect();
      const parent = h.closest('[style*="opacity"], [style*="transform"]') || h;
      const style = window.getComputedStyle(parent);
      return {
        text: h.innerText.slice(0, 30),
        top: Math.round(rect.top),
        opacity: style.opacity,
        transform: style.transform
      };
    });
  });

  console.log('Headings after scroll to 2000px:');
  console.log(JSON.stringify(afterScrollElements, null, 2));

  await browser.close();
}

testAnimationTrigger().catch(console.error);
