const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function testChatFlow() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Click Negotiate Price floating button
  console.log('Clicking floating Negotiate button...');
  const floatingBtn = await page.$('button[title*="Negotiate"]');
  if (!floatingBtn) {
    console.error('Floating button not found!');
    await browser.close();
    return;
  }
  await floatingBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 1: Drawer open
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_step1_open.png') });
  console.log('Step 1: Drawer opened screenshot captured');

  // Check what sub-nav buttons exist
  const navButtons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns
      .map(b => ({ text: b.innerText.trim(), visible: b.offsetParent !== null }))
      .filter(b => b.text.includes('Offer') || b.text.includes('Chat') || b.text.includes('Negotiation'));
  });
  console.log('Found navigation buttons in drawer:', navButtons);

  // Inspect the DOM of the drawer
  const drawerInfo = await page.evaluate(() => {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea');
    return {
      formsCount: forms.length,
      inputs: Array.from(inputs).map(i => ({ name: i.name, placeholder: i.placeholder, value: i.value, type: i.type })),
      textSnippet: document.body.innerText.slice(0, 1000)
    };
  });
  console.log('Drawer inputs info:', drawerInfo.inputs);

  await browser.close();
  console.log('Reproduction check 1 done');
}

testChatFlow().catch(console.error);
