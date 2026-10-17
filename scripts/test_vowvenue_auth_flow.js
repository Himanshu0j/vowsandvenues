const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

async function testAuthFlow() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('response', async res => {
    if (res.request().resourceType() === 'fetch' || res.request().resourceType() === 'xhr') {
      try {
        const text = await res.text();
        console.log(`[API Response] ${res.request().method()} ${res.url()} [${res.status()}]`);
        fs.appendFileSync(
          path.join(ARTIFACT_DIR, 'ref_vowvenue_api_traffic.log'),
          `\n--- ${res.request().method()} ${res.url()} [${res.status()}] ---\n${text.slice(0, 1000)}\n`
        );
      } catch (e) {}
    }
  });

  console.log('Navigating to https://vowvenue.in/register...');
  await page.goto('https://vowvenue.in/register', { waitUntil: 'networkidle2' });

  const testEmail = `qa.test.${Date.now()}@vowsvenues.com`;
  console.log('Testing with email:', testEmail);

  await page.type('input[placeholder="John Doe"]', 'Staging Tester');
  await page.type('input[placeholder="m@example.com"]', testEmail);
  await page.type('input[placeholder*="9876543210"]', '9876543210');
  await page.type('input[type="password"]', 'Tester@2026Secure!');

  console.log('Clicking Create Account...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create Account'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 4000));
  console.log('URL after register:', page.url());

  const currentCookies = await page.cookies();
  console.log('Cookies after register:', currentCookies.map(c => c.name));

  // Screenshot after registration
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_vowvenue_after_register.png') });

  // Now navigate to the venue details page to see what happens when clicking "Pay 5% & confirm slot"
  console.log('Navigating to venue details page as registered user...');
  await page.goto('https://vowvenue.in/venues/042de697-d3d2-4d1b-9da1-5182c2e4470e', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Clicking "Pay 5% & confirm slot"...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pay 5%'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  console.log('URL after clicking Pay 5%:', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_vowvenue_after_pay5_click.png') });

  // Also check if any modal opened
  const modalText = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], [class*="modal"], [class*="sheet"]');
    return modal ? modal.innerText : 'No modal found';
  });
  console.log('Modal text after clicking Pay 5%:', modalText);

  // Now test "Request a meeting"
  console.log('Clicking "Request a meeting"...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Request a meeting'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  const meetingModalText = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], [class*="modal"], [class*="sheet"]');
    return modal ? modal.innerText : 'No modal found';
  });
  console.log('Meeting Modal text:', meetingModalText);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_vowvenue_request_meeting_modal.png') });

  // Check header navigation for signed in user
  const userNav = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('header a, nav a, header button')).map(el => el.innerText.trim());
  });
  console.log('Header items for logged in user:', userNav);

  await browser.close();
}

testAuthFlow().catch(console.error);
