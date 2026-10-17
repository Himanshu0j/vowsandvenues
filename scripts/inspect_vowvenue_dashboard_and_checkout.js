const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

async function inspectDashboard() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Logging in to inspect dashboard...');
  await page.goto('https://vowvenue.in/login', { waitUntil: 'networkidle2' });
  
  // Use registered credentials or register new
  const email = `qa.auditor.${Date.now()}@vowsvenues.com`;
  await page.goto('https://vowvenue.in/register', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="John Doe"]', 'Devika Sharma');
  await page.type('input[placeholder="m@example.com"]', email);
  await page.type('input[placeholder*="9876543210"]', '9876501234');
  await page.type('input[type="password"]', 'RoyalVows2026!');
  
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Account'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  console.log('Current URL (should be dashboard):', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_vowvenue_dashboard.png'), fullPage: true });

  const dashboardContent = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({ tag: h.tagName, text: h.innerText.trim() }));
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button')).map(b => b.innerText.trim()).filter(t => t.length > 0 && t.length < 40);
    const textSnippet = document.body.innerText.slice(0, 2000);
    return {
      title: document.title,
      headings,
      tabs: tabs.slice(0, 25),
      textSnippet
    };
  });

  console.log('Dashboard Data:', JSON.stringify(dashboardContent, null, 2));

  // Now test booking wizard step 2 (selecting an OPEN date and clicking Pay & Confirm Booking)
  console.log('Navigating to venue to test booking date selection & payment trigger...');
  await page.goto('https://vowvenue.in/venues/042de697-d3d2-4d1b-9da1-5182c2e4470e', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pay 5%'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Select an open date
  await page.evaluate(() => {
    const days = Array.from(document.querySelectorAll('button, div')).filter(el => el.innerText.includes('OPEN'));
    if (days.length > 0) {
      days[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const wizardModalScreenshot = 'ref_vowvenue_wizard_date_selected.png';
  await page.screenshot({ path: path.join(ARTIFACT_DIR, wizardModalScreenshot) });

  // Check what happens when clicking "Pay & Confirm Booking"
  console.log('Clicking "Pay & Confirm Booking"...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pay & Confirm'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  const checkoutStateScreenshot = 'ref_vowvenue_checkout_state.png';
  await page.screenshot({ path: path.join(ARTIFACT_DIR, checkoutStateScreenshot) });
  console.log('Checkout / Payment State URL:', page.url());

  const paymentPageContent = await page.evaluate(() => {
    return {
      url: window.location.href,
      bodySnippet: document.body.innerText.slice(0, 1500),
      hasRazorpay: !!document.querySelector('.razorpay-container, iframe[src*="razorpay"]')
    };
  });
  console.log('Payment Page Content:', paymentPageContent);

  // Now test "Request a meeting" modal
  console.log('Testing "Request a meeting" flow...');
  await page.goto('https://vowvenue.in/venues/042de697-d3d2-4d1b-9da1-5182c2e4470e', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click Request a meeting
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Request a meeting'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const meetingScreenshot = 'ref_vowvenue_meeting_dialog.png';
  await page.screenshot({ path: path.join(ARTIFACT_DIR, meetingScreenshot) });

  const meetingForm = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], [class*="modal"]');
    if (!modal) return 'No modal';
    return {
      text: modal.innerText,
      inputs: Array.from(modal.querySelectorAll('input, select, textarea, button')).map(i => i.placeholder || i.name || i.innerText)
    };
  });
  console.log('Meeting Form Details:', meetingForm);

  await browser.close();
}

inspectDashboard().catch(console.error);
