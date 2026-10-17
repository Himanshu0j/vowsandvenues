const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowvenue.in/';

async function run() {
  console.log('--- Phase 1: Exploring Reference Website https://vowvenue.in/ ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1440, height: 900 });

  const networkRequests = [];
  page.on('request', req => {
    if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
      networkRequests.push({ url: req.url(), method: req.method() });
    }
  });

  try {
    console.log('Navigating to', TARGET_URL);
    const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    console.log('Response Status:', response ? response.status() : 'null');
    console.log('Current URL:', page.url());

    await new Promise(r => setTimeout(r, 3000));

    // Capture desktop screenshot
    const homeScreenshot = path.join(ARTIFACT_DIR, 'ref_vowvenue_home_desktop.png');
    await page.screenshot({ path: homeScreenshot, fullPage: false });
    console.log('Saved home desktop screenshot:', homeScreenshot);

    // Extract page metadata, links, buttons, inputs
    const pageData = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.innerText.trim().replace(/\s+/g, ' '),
        href: a.href,
        target: a.target
      })).filter(l => l.text.length > 0 || l.href.includes('venue') || l.href.includes('login') || l.href.includes('vendor'));

      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim().replace(/\s+/g, ' '),
        id: b.id,
        className: b.className
      })).filter(b => b.text.length > 0);

      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).map(i => ({
        tag: i.tagName,
        type: i.type,
        name: i.name,
        placeholder: i.placeholder,
        id: i.id,
        value: i.value
      }));

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
        tag: h.tagName,
        text: h.innerText.trim().replace(/\s+/g, ' ')
      })).slice(0, 30);

      return {
        title: document.title,
        links: links.slice(0, 50),
        buttons: buttons.slice(0, 30),
        inputs,
        headings,
        bodySnippet: document.body.innerText.slice(0, 1000)
      };
    });

    console.log('Page Title:', pageData.title);
    console.log('Discovered Headings:', pageData.headings);
    console.log('Discovered Inputs:', pageData.inputs);
    console.log('Discovered Links Count:', pageData.links.length);
    console.log('Sample Links:', JSON.stringify(pageData.links.slice(0, 20), null, 2));
    console.log('Discovered Buttons:', JSON.stringify(pageData.buttons.slice(0, 15), null, 2));

    // Save full inspection data to JSON
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'ref_vowvenue_home_data.json'), JSON.stringify({
      url: page.url(),
      title: pageData.title,
      headings: pageData.headings,
      inputs: pageData.inputs,
      links: pageData.links,
      buttons: pageData.buttons,
      networkRequests
    }, null, 2));

    // Mobile Viewport test (390 x 844)
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await new Promise(r => setTimeout(r, 1500));
    const mobileScreenshot = path.join(ARTIFACT_DIR, 'ref_vowvenue_home_mobile.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log('Saved home mobile screenshot:', mobileScreenshot);

  } catch (err) {
    console.error('Error inspecting reference site:', err);
  } finally {
    await browser.close();
  }
}

run();
