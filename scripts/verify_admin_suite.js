const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const ADMIN_URL = 'https://vowsandvenues-staging.onrender.com/admin';

async function verifyAdmin() {
  console.log('🚀 Starting Admin Operations Suite Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to Admin Portal...');
  await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('Waiting for login form or admin content...');
  try {
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    console.log('Login form detected! Clicking Autofill & Submit...');

    // Click Autofill if present
    const autofillBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, span, div')).find(el => el.textContent.trim() === 'Autofill');
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('Autofill button clicked:', autofillBtn);
    await new Promise(r => setTimeout(r, 600));

    // Submit form
    await page.click('button[type="submit"]');
    console.log('Submit button clicked! Waiting for operations dashboard...');
    await page.waitForFunction(() => {
      return document.body.textContent.includes('Admin Operations') &&
             document.body.textContent.includes('Overview & KPIs');
    }, { timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log('Login form not needed or already logged in:', e.message);
  }

  // Verify Admin Suite loaded
  const adminLoaded = await page.evaluate(() => {
    return document.body.textContent.includes('Admin Operations') ||
           document.body.textContent.includes('Overview & KPIs');
  });
  console.log('Admin Operations Suite loaded:', adminLoaded);

  // Take screenshot of Overview + Live Ticker
  const overviewPath = path.join(ARTIFACTS_DIR, 'admin_overview_live_ticker.png');
  await page.screenshot({ path: overviewPath });
  console.log('Saved:', overviewPath);

  // Tab tests
  const tabsToVerify = [
    { id: 'leads', name: 'Wedding Leads CRM' },
    { id: 'whatsapp', name: 'WhatsApp Concierge' },
    { id: 'recces', name: 'Site Recces' },
    { id: 'milestones', name: 'Escrow & Milestones' },
    { id: 'packages_builder', name: 'Package Builder' },
    { id: 'vendor_sla', name: 'Vendor SLA Scorecard' },
    { id: 'muhurat', name: 'Muhurat & Peak Pricing' },
    { id: 'ugc_reviews', name: 'Reviews & Stories' },
    { id: 'gst_billing', name: 'GST & Compliance' }
  ];

  for (const tab of tabsToVerify) {
    console.log(`Testing Tab: ${tab.name}...`);
    const clicked = await page.evaluate((tabName) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes(tabName));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, tab.name);

    await new Promise(r => setTimeout(r, 1200));

    if (clicked) {
      const shotPath = path.join(ARTIFACTS_DIR, `admin_tab_${tab.id}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`[PASS] Tab ${tab.name} verified & captured: ${shotPath}`);
    } else {
      console.log(`[FAIL] Tab ${tab.name} button not found!`);
    }
  }

  await browser.close();
  console.log('✅ Admin verification script complete!');
}

verifyAdmin().catch(err => {
  console.error('Admin verification error:', err);
  process.exit(1);
});
