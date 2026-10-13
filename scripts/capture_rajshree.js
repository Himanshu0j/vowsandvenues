const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = 'https://vowsandvenues-staging.onrender.com';

async function testRajshree() {
  console.log('Testing Rajshree AI Concierge on live staging...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Opening Rajshree AI Concierge...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Rajshree AI Concierge') || (b.title && b.title.includes('Rajshree')));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Clicking Udaipur Lakeside prompt...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pBtn = btns.find(b => b.textContent.includes('Udaipur Lakeside'));
    if (pBtn) pBtn.click();
  });

  // Wait for 1.8s for simulation thinking state to resolve
  await new Promise(r => setTimeout(r, 2000));

  // Scroll down inside the modal container so the generated proposal card is in view
  await page.evaluate(() => {
    const modalScroll = document.querySelector('.overflow-y-auto');
    if (modalScroll) {
      modalScroll.scrollTop = modalScroll.scrollHeight;
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot proposal generated
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'rajshree_ai_generated_proposal.png'), fullPage: false });

  // Mobile viewport screenshot of proposal
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => {
    const modalScroll = document.querySelector('.overflow-y-auto');
    if (modalScroll) {
      modalScroll.scrollTop = modalScroll.scrollHeight;
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'rajshree_ai_mobile_proposal.png'), fullPage: false });

  await browser.close();
  console.log('Done capturing Rajshree AI Proposal!');
}

testRajshree();
