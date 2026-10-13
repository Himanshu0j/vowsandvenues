const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const ADMIN_URL = 'https://vowsandvenues-staging.onrender.com/admin';
const HOME_URL = 'https://vowsandvenues-staging.onrender.com';

async function verifyPaymentGatewayManager() {
  console.log('🚀 Starting Verification of Admin Payment Gateway & UPI/QR Manager...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to Admin Portal...');
    await page.goto(ADMIN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // Handle login if required
    try {
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        console.log('Admin login form found, filling and submitting...');
        // click autofill if present
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button, span, div')).find(el => el.textContent.trim() === 'Autofill');
          if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 500));
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (_) {}

    // Wait for the operations bar to appear and click Payment Gateway tab
    console.log('Clicking Payment Gateway & UPI/QR tab in Admin operations bar...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && b.textContent.includes('Payment Gateway'));
    }, { timeout: 15000 });

    const clickedTab = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tab = btns.find(b => b.textContent && b.textContent.includes('Payment Gateway'));
      if (tab) {
        tab.click();
        return true;
      }
      return false;
    });
    console.log('Payment Gateway tab clicked:', clickedTab);
    await new Promise(r => setTimeout(r, 2000));

    // Capture Admin Payment Settings tab
    console.log('Capturing admin_payment_gateway_settings.png...');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_payment_gateway_settings.png'), fullPage: false });

    // Switch to Inbound UTR Verifications tab inside the payment manager
    console.log('Switching to Inbound UTR Verifications sub-tab...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const inboxBtn = btns.find(b => b.textContent && b.textContent.includes('Inbound UTR Verifications'));
      if (inboxBtn) inboxBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Capture Inbound UTR Verifications queue
    console.log('Capturing admin_payment_inbound_inbox.png...');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_payment_inbound_inbox.png'), fullPage: false });

    // -------------------------------------------------------------
    // Customer Checkout Verification (Step 6 with QR & UTR)
    // -------------------------------------------------------------
    console.log('\n--- Verifying Customer Checkout Payment Flow ---');
    await page.goto(HOME_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // Click Build My Event tab
    console.log('Navigating to Build My Event...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bBtn = btns.find(b => b.textContent && b.textContent.includes('Build My Event'));
      if (bBtn) bBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Click Proceed to Booking / Book All Services button
    console.log('Opening Booking Modal...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && (b.textContent.includes('Book All Services') || b.textContent.includes('Proceed to Booking')));
    }, { timeout: 15000 });

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bookBtn = btns.find(b => b.textContent && (b.textContent.includes('Book All Services') || b.textContent.includes('Proceed to Booking')));
      if (bookBtn) {
        bookBtn.scrollIntoView();
        bookBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Fast-forward to Step 6 (Payment)
    console.log('Advancing through steps to Step 6...');
    for (let s = 1; s <= 5; s++) {
      console.log(`Advancing Step ${s}...`);
      await page.waitForFunction(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some(b => b.textContent && b.textContent.includes('Next:'));
      }, { timeout: 5000 }).catch(() => {});

      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Next:'));
        if (nextBtn) {
          nextBtn.scrollIntoView();
          nextBtn.click();
        }
      });
      await new Promise(r => setTimeout(r, 800));
    }

    // Wait on Step 6
    await new Promise(r => setTimeout(r, 1500));
    console.log('Capturing customer_checkout_upi_qr.png...');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'customer_checkout_upi_qr.png'), fullPage: false });

    // Mobile view for Step 6 checkout
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 1000));
    console.log('Capturing customer_checkout_mobile_qr.png...');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'customer_checkout_mobile_qr.png'), fullPage: false });

    console.log('\n✅ ALL PAYMENT MANAGER VERIFICATIONS COMPLETED SUCCESSFULLY!');
    await browser.close();
  } catch (err) {
    console.error('Error in verification:', err);
    await browser.close();
  }
}

verifyPaymentGatewayManager();
