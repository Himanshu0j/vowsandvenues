const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkPoster() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.goto('https://vowsandvenues-staging.onrender.com/', { waitUntil: 'networkidle2' });
  
  const metrics = await page.evaluate(() => {
    const img = document.querySelector('img[alt*="Rambagh"]');
    const container = img ? img.parentElement : null;
    const section = img ? img.closest('section') : null;
    return {
      windowWidth: window.innerWidth,
      sectionScrollWidth: section?.scrollWidth,
      sectionClientWidth: section?.clientWidth,
      containerRect: container ? {
        width: container.getBoundingClientRect().width,
        height: container.getBoundingClientRect().height,
        left: container.getBoundingClientRect().left,
        right: container.getBoundingClientRect().right
      } : null,
      imgRect: img ? {
        width: img.getBoundingClientRect().width,
        height: img.getBoundingClientRect().height,
        left: img.getBoundingClientRect().left,
        right: img.getBoundingClientRect().right
      } : null
    };
  });
  console.log('MEASURED POSTER METRICS:', metrics);
  await browser.close();
}

checkPoster().catch(console.error);
