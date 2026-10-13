const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = 'https://vowsandvenues-staging.onrender.com';

async function verifyAllFeatures() {
  console.log('🚀 Starting Comprehensive Verification of New Features...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // -------------------------------------------------------------
    // 1. VENDOR PARTNER PORTAL VERIFICATION (/vendor)
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Vendor Partner Portal ---');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(`${BASE_URL}/vendor`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // Verify Title & Overview tab
    const vendorTitle = await page.$eval('h1', el => el.textContent);
    console.log(`[Vendor Portal] Current Storefront: ${vendorTitle}`);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_portal_overview.png'), fullPage: false });

    // Test Lead Inbox & Negotiations Tab
    console.log('[Vendor Portal] Switching to Leads & Negotiations Tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const leadTab = tabs.find(t => t.textContent.includes('Lead Inbox & Negotiations'));
      if (leadTab) leadTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_portal_negotiations.png'), fullPage: false });

    // Test Calendar Blackout Dates Tab
    console.log('[Vendor Portal] Switching to Calendar Availability Tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const calTab = tabs.find(t => t.textContent.includes('Blackout Dates & Calendar'));
      if (calTab) calTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_portal_calendar.png'), fullPage: false });

    // Test Bank KYC & Escrow Payouts Tab
    console.log('[Vendor Portal] Switching to Bank KYC & Escrow Tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const kycTab = tabs.find(t => t.textContent.includes('Bank KYC & Escrow Payouts'));
      if (kycTab) kycTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_portal_kyc.png'), fullPage: false });

    // Test Mobile View for Vendor Portal
    console.log('[Vendor Portal] Testing Mobile View (390x844)...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'vendor_portal_mobile.png'), fullPage: false });
    await page.close();

    // -------------------------------------------------------------
    // 2. COUPLE WEDDING TOOLKIT VERIFICATION (Desktop & Mobile)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Couple Wedding Toolkit ---');
    const toolkitPage = await browser.newPage();
    await toolkitPage.setViewport({ width: 1440, height: 900 });

    await toolkitPage.goto(`${BASE_URL}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // Click "Wedding Toolkit" in Navbar
    console.log('[Toolkit] Clicking Wedding Toolkit nav link...');
    await toolkitPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const toolkitBtn = buttons.find(b => b.textContent.includes('Wedding Toolkit'));
      if (toolkitBtn) toolkitBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Verify Budget Planner section
    console.log('[Toolkit] Capturing Budget Planner view...');
    await toolkitPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'couple_wedding_toolkit_budget.png'), fullPage: false });

    // Switch to Guest List & RSVP Manager tab
    console.log('[Toolkit] Switching to Guest List & RSVP tab...');
    await toolkitPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const guestTab = buttons.find(b => b.textContent.includes('Guest List & RSVP Manager'));
      if (guestTab) guestTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await toolkitPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'couple_wedding_toolkit_guests.png'), fullPage: false });

    // Test Mobile View for Toolkit
    console.log('[Toolkit] Testing Mobile View (390x844)...');
    await toolkitPage.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 1000));
    await toolkitPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'couple_wedding_toolkit_mobile.png'), fullPage: false });
    await toolkitPage.close();

    // -------------------------------------------------------------
    // 3. RAJSHREE AI CONCIERGE VERIFICATION (Homepage & Drawer)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Rajshree AI Concierge ---');
    const aiPage = await browser.newPage();
    await aiPage.setViewport({ width: 1440, height: 900 });

    await aiPage.goto(`${BASE_URL}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // Find and click Rajshree AI floating trigger
    console.log('[Rajshree AI] Finding floating trigger button...');
    const clickedTrigger = await aiPage.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Ask Rajshree AI Concierge"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('[Rajshree AI] Floating trigger clicked:', clickedTrigger);
    await new Promise(r => setTimeout(r, 1500));
    await aiPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'rajshree_ai_drawer_opened.png'), fullPage: false });

    // Click quick prompt "Udaipur Lakeside 3-Day Wedding"
    console.log('[Rajshree AI] Selecting Udaipur Lakeside prompt...');
    await aiPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const promptBtn = buttons.find(b => b.textContent.includes('Udaipur Lakeside'));
      if (promptBtn) promptBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Capture Proposal generated
    console.log('[Rajshree AI] Capturing generated proposal...');
    await aiPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'rajshree_ai_curated_proposal.png'), fullPage: false });

    // Test Mobile View for Rajshree AI
    console.log('[Rajshree AI] Testing Mobile View (390x844)...');
    await aiPage.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 1000));
    await aiPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'rajshree_ai_mobile.png'), fullPage: false });
    await aiPage.close();

    console.log('\n✅ ALL FEATURE VERIFICATIONS COMPLETE!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verifyAllFeatures();
