const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function reproduceBug() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Open drawer
  console.log('Opening drawer...');
  await page.click('button[title*="Negotiate"]');
  await new Promise(r => setTimeout(r, 1000));

  // 2. Fill form and submit negotiation 1
  console.log('Filling form for negotiation 1...');
  await page.type('input[placeholder*="Full Name"]', 'Aditya Verma');
  await page.type('input[placeholder*="Email address"]', 'aditya.verma@example.com');
  await page.type('input[placeholder*="Phone"]', '+91 98765 11111');
  await page.type('textarea[placeholder*="Reason"]', 'Looking for special family rate for our upcoming reception.');

  console.log('Submitting offer 1...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3500));

  // Screenshot: Chat view for negotiation 1
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_neg1_active.png') });
  console.log('Neg 1 chat active captured.');

  // Check state: Are we in chat view?
  const viewState1 = await page.evaluate(() => {
    const activeTab = document.querySelector('div.border-t button.bg-\\[\\#c5a059\\]')?.innerText;
    const bodyHeadings = Array.from(document.querySelectorAll('h4')).map(h => h.innerText);
    const tabs = Array.from(document.querySelectorAll('div.border-t button')).map(b => b.innerText.trim());
    return { activeTab, bodyHeadings, tabs };
  });
  console.log('State 1 (after submitting neg 1):', viewState1);

  // Send a message in Neg 1
  console.log('Sending message in Neg 1...');
  await page.type('input[placeholder*="Type your reply"]', 'Hello, any discount possible?');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // Now create negotiation 2: click "+ Make New Offer"
  console.log('Clicking "+ Make New Offer"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Make New Offer'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_make_new_offer_clicked.png') });
  console.log('Make new offer clicked.');

  // Select another vendor from the dropdown if present
  console.log('Submitting Neg 2...');
  const selectExists = await page.$('select');
  if (selectExists) {
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      const vendorSelect = Array.from(selects).find(s => s.options.length > 3);
      if (vendorSelect && vendorSelect.options.length > 2) {
        vendorSelect.selectedIndex = 1;
        vendorSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  await new Promise(r => setTimeout(r, 500));
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_neg2_active.png') });
  console.log('Neg 2 chat active captured.');

  const viewState2 = await page.evaluate(() => {
    const activeTab = document.querySelector('div.border-t button.bg-\\[\\#c5a059\\]')?.innerText;
    const bodyHeadings = Array.from(document.querySelectorAll('h4')).map(h => h.innerText);
    const tabs = Array.from(document.querySelectorAll('div.border-t button')).map(b => b.innerText.trim());
    return { activeTab, bodyHeadings, tabs };
  });
  console.log('State 2 (after submitting neg 2):', viewState2);

  // Now user clicks "My Negotiations" tab!
  console.log('Clicking "My Negotiations"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('My Negotiations'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_list_view.png') });
  console.log('List view captured.');

  // Now user clicks on the first negotiation item in the list
  console.log('Clicking on item in My Negotiations list...');
  await page.evaluate(() => {
    const items = document.querySelectorAll('div.cursor-pointer');
    if (items.length > 0) items[items.length - 1].click(); // click older negotiation
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_switched_neg.png') });
  console.log('Switched negotiation captured.');

  // Now test user clicking "Active Chat" and then clicking another option!
  console.log('Clicking "Active Chat"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Active Chat'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Now clicking "+ Make New Offer" or closing/reopening or clicking another tab!
  console.log('Clicking "+ Make New Offer" from Active Chat...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Make New Offer'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_after_switching_to_new.png') });

  // Close drawer and reopen
  console.log('Closing drawer...');
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button svg.lucide-x')?.parentElement;
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Reopening drawer from floating button...');
  await page.click('button[title*="Negotiate"]');
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reproduce_chat_reopened.png') });

  const finalState = await page.evaluate(() => {
    const activeTab = document.querySelector('div.border-t button.bg-\\[\\#c5a059\\]')?.innerText;
    const bodyHeadings = Array.from(document.querySelectorAll('h4')).map(h => h.innerText);
    const tabs = Array.from(document.querySelectorAll('div.border-t button')).map(b => b.innerText.trim());
    return { activeTab, bodyHeadings, tabs };
  });
  console.log('Final state on reopen:', finalState);

  await browser.close();
  console.log('Reproduction flow completed.');
}

reproduceBug().catch(console.error);
