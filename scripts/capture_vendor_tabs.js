const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const VENDOR_URL = 'https://vowsandvenues-staging.onrender.com/vendor';

async function captureAllVendorTabs() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(VENDOR_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Leads Tab (index 1 in the tabs container)
  console.log('Clicking Leads tab...');
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Lead Inbox') || b.textContent.includes('Availability') || b.textContent.includes('Bank KYC') || b.textContent.includes('Pricing & Capacity'));
    const leadsBtn = tabBtns.find(b => b.textContent.includes('Lead Inbox'));
    if (leadsBtn) leadsBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_tab_leads.png'), fullPage: false });

  // 2. Calendar Tab
  console.log('Clicking Calendar tab...');
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Availability'));
    if (tabBtns[0]) tabBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_tab_calendar.png'), fullPage: false });

  // 3. Bank KYC Tab
  console.log('Clicking Bank KYC tab...');
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Bank KYC'));
    if (tabBtns[0]) tabBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_tab_kyc.png'), fullPage: false });

  // 4. Pricing & Capacity Tab
  console.log('Clicking Pricing & Capacity tab...');
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Pricing & Capacity'));
    if (tabBtns[0]) tabBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_tab_pricing.png'), fullPage: false });

  console.log('All vendor tabs captured successfully!');
  await browser.close();
}

captureAllVendorTabs();
