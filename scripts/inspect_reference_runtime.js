const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspectMotion() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('https://vow-iecp366.app.builtwithrocket.new/home', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 3000));

  // Let's inspect all script elements and their text or sources
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => ({
      src: s.src,
      inlineSnippet: s.innerText.slice(0, 150)
    }));
  });
  console.log('Scripts on rendered page:', JSON.stringify(scripts, null, 2));

  // Let's inspect style sheets loaded on rendered page
  const styles = await page.evaluate(() => {
    const list = [];
    for (let sheet of document.styleSheets) {
      try {
        list.push({
          href: sheet.href,
          rulesCount: sheet.cssRules ? sheet.cssRules.length : 0
        });
      } catch (e) {
        list.push({ href: sheet.href, error: e.message });
      }
    }
    return list;
  });
  console.log('Stylesheets:', JSON.stringify(styles, null, 2));

  // Check if any element transforms or animates while scrolling
  const scrollTest = await page.evaluate(async () => {
    const trackedElements = Array.from(document.querySelectorAll('h1, h2, h3, p, img, [class*="section"]')).slice(0, 30);
    const initialTransforms = trackedElements.map(el => ({
      text: el.innerText ? el.innerText.slice(0, 30) : el.tagName,
      transform: window.getComputedStyle(el).transform,
      opacity: window.getComputedStyle(el).opacity,
      top: el.getBoundingClientRect().top
    }));

    // Scroll down 800px
    window.scrollTo({ top: 800, behavior: 'smooth' });
    await new Promise(r => setTimeout(r, 1000));

    const afterTransforms = trackedElements.map(el => ({
      text: el.innerText ? el.innerText.slice(0, 30) : el.tagName,
      transform: window.getComputedStyle(el).transform,
      opacity: window.getComputedStyle(el).opacity,
      top: el.getBoundingClientRect().top
    }));

    return {
      initialTransforms: initialTransforms.slice(0, 10),
      afterTransforms: afterTransforms.slice(0, 10)
    };
  });

  console.log('Scroll transforms test:', JSON.stringify(scrollTest, null, 2));

  await browser.close();
}

inspectMotion().catch(console.error);
