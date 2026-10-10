const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log('Navigating to reference...');
  await page.goto('https://vow-iecp366.app.builtwithrocket.new/home', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // Extract sections and text
  const inspection = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: h.innerText.trim().replace(/\n+/g, ' '),
      classes: h.className
    }));

    const sections = Array.from(document.querySelectorAll('section, main > div')).map(s => ({
      tag: s.tagName,
      className: s.className,
      textSample: s.innerText.trim().slice(0, 120).replace(/\n+/g, ' '),
      imgCount: s.querySelectorAll('img').length
    }));

    return {
      title: document.title,
      scrollHeight: document.body.scrollHeight,
      headings,
      sections
    };
  });

  console.log('Inspection Data:', JSON.stringify(inspection, null, 2));

  // Slow smooth scroll to trigger animations
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      let timer = setInterval(() => {
        window.scrollBy(0, 350);
        total += 350;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
  await new Promise(r => setTimeout(r, 3000));

  const fullPath = path.join(ARTIFACT_DIR, 'reference_home_full.png');
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log('Saved:', fullPath);

  await browser.close();
})();
