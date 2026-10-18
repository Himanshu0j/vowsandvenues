const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = process.env.TARGET_URL || 'https://vowsandvenues-staging.onrender.com';

async function runBrowserAuthFlow() {
  console.log('\n======================================================');
  console.log('TESTING BROWSER IN-CONTEXT AUTH MODAL & DRAFT RESTORE');
  console.log(`Target: ${BASE_URL}/venues/v_royal_palace_lko`);
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Clear local/session storage to guarantee unauthenticated state
  await page.goto(`${BASE_URL}/venues/v_royal_palace_lko`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  console.log('1. Page loaded in clean anonymous state.');

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Wait for venue data hydration and booking button to appear
  console.log('Waiting for "Pay 5% & confirm slot" button to render...');
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes('Pay 5% & confirm slot'));
  }, { timeout: 15000 });

  // Click the booking button while unauthenticated
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Pay 5% & confirm slot'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    throw new Error('Pay 5% & confirm slot button could not be clicked.');
  }

  await delay(1500);

  // Verify that the In-Context Auth Modal has opened
  const authModalTitle = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h3'));
    const modalH3 = headings.find(h => h.textContent.includes('Sign In to Proceed') || h.textContent.includes('Create Your Account'));
    return modalH3 ? modalH3.textContent.trim() : null;
  });

  console.log('2. In-Context Auth Modal Heading:', authModalTitle);
  const modalOpened = authModalTitle === 'Sign In to Proceed';

  // Screenshot Auth Modal
  const authModalShotPath = path.join(ARTIFACT_DIR, 'auth_modal_in_context.png');
  await page.screenshot({ path: authModalShotPath, fullPage: false });
  console.log(`Saved screenshot: ${authModalShotPath}`);

  // Switch to "Create Account" tab inside the modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const createTab = btns.find(b => b.textContent.trim() === 'Create Account');
    if (createTab) createTab.click();
  });
  await delay(600);

  const testEmail = `royal.couple.${Date.now()}@vowsvenues-test.com`;
  const testName = 'Devika & Kabir';
  const testPhone = '9876543210';
  const testPass = 'RoyalWedding2026!';

  console.log(`3. Registering fresh couple via Auth Modal: ${testEmail}`);

  // Type into inputs using React-compatible setter
  await page.evaluate((name, email, phone, pass) => {
    function setReactInput(input, val) {
      if (!input) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const inputs = Array.from(document.querySelectorAll('input'));
    const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Devika'));
    const emailInput = inputs.find(i => i.placeholder && i.placeholder.includes('couple@example.com'));
    const phoneInput = inputs.find(i => i.placeholder && i.placeholder.includes('9876543210'));
    const passInput = inputs.find(i => i.type === 'password');

    setReactInput(nameInput, name);
    setReactInput(emailInput, email);
    setReactInput(phoneInput, phone);
    setReactInput(passInput, pass);
  }, testName, testEmail, testPhone, testPass);

  await delay(500);

  // Click "Create Account & Continue"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.textContent.includes('Create Account & Continue'));
    if (submitBtn) submitBtn.click();
  });

  console.log('4. Submitted registration form inside modal, awaiting auth and draft restore...');
  await delay(5000);

  // Check if booking wizard modal opened
  const wizardTitle = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h3'));
    const wizH3 = headings.find(h => h.textContent.includes('Book '));
    return wizH3 ? wizH3.textContent.trim() : null;
  });

  console.log('5. Post-Auth Wizard Heading:', wizardTitle);
  const wizardOpened = !!wizardTitle;

  // Verify token storage
  const wizardState = await page.evaluate(() => {
    return {
      hasAuthToken: !!(localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')),
      currentUser: localStorage.getItem('vv_current_user')
    };
  });

  console.log('6. Auth Token Present in LocalStorage:', wizardState.hasAuthToken);
  console.log('   Current User Data:', wizardState.currentUser);

  // Screenshot Wizard Modal
  const wizardShotPath = path.join(ARTIFACT_DIR, 'booking_wizard_post_auth.png');
  await page.screenshot({ path: wizardShotPath, fullPage: false });
  console.log(`Saved screenshot: ${wizardShotPath}`);

  await browser.close();

  const success = modalOpened && wizardOpened && wizardState.hasAuthToken;
  console.log(`\nBROWSER AUTH FLOW RESULT: ${success ? '✓ PASS' : '✗ FAIL'}`);
  return success;
}

runBrowserAuthFlow().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
