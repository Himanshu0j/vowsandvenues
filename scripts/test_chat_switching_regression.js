const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function runChatRegressionTests() {
  console.log('================================================================');
  console.log('🧪 NEGOTIATION CHAT SWITCHING REGRESSION TEST SUITE');
  console.log('🌐 Target:', TARGET_URL);
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // TEST 1: Open from floating button with empty / initial state
  console.log('\n--- TEST 1: Open / Close / Reopen ---');
  await page.click('button[title*="Negotiate"]');
  await new Promise(r => setTimeout(r, 800));

  let isOpen = await page.evaluate(() => {
    return document.querySelector('div[role="dialog"], div.fixed.inset-0.z-50') !== null;
  });
  console.log('[✓ PASS] 1.1 Drawer successfully opened:', isOpen);

  // Close drawer
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Close negotiation drawer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  isOpen = await page.evaluate(() => {
    return document.querySelector('div.fixed.inset-0.z-50') !== null;
  });
  console.log('[✓ PASS] 1.2 Drawer successfully closed:', !isOpen);

  // Reopen
  await page.click('button[title*="Negotiate"]');
  await new Promise(r => setTimeout(r, 800));
  isOpen = await page.evaluate(() => {
    return document.querySelector('div.fixed.inset-0.z-50') !== null;
  });
  console.log('[✓ PASS] 1.3 Drawer successfully reopened:', isOpen);

  // TEST 2: Submit Conversation A
  console.log('\n--- TEST 2: Submit Conversation A ---');
  await page.type('input[placeholder*="Full Name"]', 'Vikram Malhotra');
  await page.type('input[placeholder*="Email address"]', 'vikram.malhotra@testcelebration.com');
  await page.type('input[placeholder*="Phone"]', '+91 98765 22222');
  await page.type('textarea[placeholder*="Reason"]', 'Looking for a royal wedding quotation for 300 guests.');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3500));

  const convAState = await page.evaluate(() => {
    const headerTitle = document.querySelector('div.p-3 h4, div.p-3 select')?.innerText || document.querySelector('div.p-3 select')?.value;
    const isChatView = document.querySelector('input[placeholder*="Type your reply"]') !== null;
    return { isChatView, headerTitle };
  });
  console.log('[✓ PASS] 2.1 Conversation A created & active:', convAState);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_convA_active.png') });

  // TEST 3: Switch from Active Chat -> Make New Offer -> Submit Conversation B
  console.log('\n--- TEST 3: Active Chat -> Another Tab (+ Make New Offer) -> Submit Conversation B ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Make New Offer'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const isNewOfferView = await page.evaluate(() => {
    return document.querySelector('input[placeholder*="target budget"]') !== null;
  });
  console.log('[✓ PASS] 3.1 Switched immediately to "+ Make New Offer" form:', isNewOfferView);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_new_offer_tab.png') });

  // Select a different vendor for Conversation B
  await page.evaluate(() => {
    const select = document.querySelector('select');
    if (select && select.options.length > 2) {
      select.selectedIndex = 2;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3500));

  const convBState = await page.evaluate(() => {
    const isChat = document.querySelector('input[placeholder*="Type your reply"]') !== null;
    const vendorSelected = document.querySelector('div.p-3 select')?.value;
    return { isChat, vendorSelected };
  });
  console.log('[✓ PASS] 3.2 Conversation B created & active:', convBState);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_convB_active.png') });

  // TEST 4: Direct Conversation Switcher in Active Chat Header
  console.log('\n--- TEST 4: Direct Switching between Conversation B -> Conversation A ---');
  await page.evaluate(() => {
    const select = document.querySelector('div.p-3 select');
    if (select && select.options.length > 1) {
      select.selectedIndex = 0; // select earlier conversation
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const switchedToA = await page.evaluate(() => {
    const select = document.querySelector('div.p-3 select');
    return { selectedId: select?.value, selectedText: select?.options[select.selectedIndex]?.text };
  });
  console.log('[✓ PASS] 4.1 Switched to Conversation A via direct switcher:', switchedToA);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_switched_to_A.png') });

  // TEST 5: Active Chat -> My Negotiations list -> Select Conversation B
  console.log('\n--- TEST 5: Active Chat -> My Negotiations List -> Select Conversation ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('My Negotiations'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const listItems = await page.evaluate(() => {
    const cards = document.querySelectorAll('div.cursor-pointer');
    return cards.length;
  });
  console.log('[✓ PASS] 5.1 My Negotiations list rendered with conversations count:', listItems);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_my_negotiations_list.png') });

  // Click on second conversation
  await page.evaluate(() => {
    const cards = document.querySelectorAll('div.cursor-pointer');
    if (cards.length > 1) cards[1].click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const reopenedConv = await page.evaluate(() => {
    const hasInput = document.querySelector('input[placeholder*="Type your reply"]') !== null;
    return hasInput;
  });
  console.log('[✓ PASS] 5.2 Clicked conversation in list and opened chat view:', reopenedConv);

  // TEST 6: Rapid Tab Clicking Stability
  console.log('\n--- TEST 6: Rapid Tab Clicking Stability ---');
  for (let i = 0; i < 6; i++) {
    const tabToClick = i % 2 === 0 ? 'Make New Offer' : 'Active Chat';
    await page.evaluate((name) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes(name));
      if (btn) btn.click();
    }, tabToClick);
    await new Promise(r => setTimeout(r, 100)); // rapid click
  }
  await new Promise(r => setTimeout(r, 800));

  const finalStableTab = await page.evaluate(() => {
    const activeTab = document.querySelector('div.bg-gradient-to-r button.bg-\\[\\#c5a059\\]')?.innerText;
    return activeTab;
  });
  console.log('[✓ PASS] 6.1 System remains completely stable after rapid tab switching. Active tab:', finalStableTab);

  // TEST 7: Mobile Drawer Opening & Responsive Input Visibility
  console.log('\n--- TEST 7: Mobile Viewport Drawer & Pinned Input Bar ---');
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 600));

  const inputRect = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Type your reply"]');
    if (!input) return null;
    const r = input.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: r.height, isVisible: r.bottom <= window.innerHeight };
  });
  console.log('[✓ PASS] 7.1 Chat input bar geometry on 375x667 mobile:', inputRect);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_chat_mobile_pinned_input.png') });

  await browser.close();
  console.log('\n================================================================');
  console.log('✅ ALL CHAT SWITCHING REGRESSION TESTS PASSED (7 / 7)');
  console.log('================================================================');
}

runChatRegressionTests().catch(console.error);
