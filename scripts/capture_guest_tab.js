const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = 'https://vowsandvenues-staging.onrender.com';

async function testGuestTab() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click Wedding Toolkit in navbar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tBtn = btns.find(b => b.textContent.includes('Wedding Toolkit'));
    if (tBtn) tBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click Guests & RSVP tab
  console.log('Clicking Guests & RSVP tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const gBtn = btns.find(b => b.textContent.includes('Guests & RSVP'));
    if (gBtn) gBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'couple_wedding_toolkit_guests.png'), fullPage: false });
  console.log('Captured couple_wedding_toolkit_guests.png');
  await browser.close();
}

testGuestTab();
