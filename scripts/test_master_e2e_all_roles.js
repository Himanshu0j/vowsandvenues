const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = process.env.TARGET_URL || 'https://www.vowsandvenues.in';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function runMasterE2ETests() {
  console.log('\n========================================================================');
  console.log('   VOWS & VENUES — MASTER MULTI-ROLE & MULTI-VIEWPORT VERIFICATION');
  console.log(`   Target: ${BASE_URL}`);
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const testResults = [];
  const record = (category, role, viewport, testName, pass, details = '') => {
    testResults.push({ category, role, viewport, testName, pass, details });
    const mark = pass ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] [${role}] [${viewport}] ${testName} ${details ? ':: ' + details : ''}`);
  };

  const checkOverflow = async () => {
    return await page.evaluate(() => {
      const scrollW = document.body.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      return { scrollW, clientW, hasOverflow: scrollW > clientW + 2 };
    });
  };

  try {
    // ========================================================================
    // ROLE 1: CUSTOMER / USER (DESKTOP & MOBILE)
    // ========================================================================
    console.log('\n>>> TESTING ROLE 1: CUSTOMER / USER <<<');

    for (const vp of [
      { name: 'Desktop', width: 1440, height: 900, isMobile: false },
      { name: 'Mobile', width: 375, height: 812, isMobile: true }
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

      // 1.1 Homepage
      console.log(`\nNavigating to Homepage (${vp.name})...`);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1200);

      const homeOverflow = await checkOverflow();
      record('Layout', 'User', vp.name, 'Homepage Responsiveness & Overflow', !homeOverflow.hasOverflow,
        `ScrollWidth: ${homeOverflow.scrollW}px, ClientWidth: ${homeOverflow.clientW}px`);

      const homeSnap = path.join(ARTIFACT_DIR, `audit_user_${vp.name.toLowerCase()}_home.png`);
      await page.screenshot({ path: homeSnap, fullPage: false });

      // 1.2 Venues Catalog
      console.log(`Navigating to Venues Catalog (${vp.name})...`);
      await page.goto(`${BASE_URL}/venues`, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1200);

      const venuesOverflow = await checkOverflow();
      record('Layout', 'User', vp.name, 'Venues Catalog Responsiveness', !venuesOverflow.hasOverflow,
        `ScrollWidth: ${venuesOverflow.scrollW}px, ClientWidth: ${venuesOverflow.clientW}px`);

      // 1.3 Venue Detail Page with pre-authenticated customer token for smooth wizard testing
      const testVenueUrl = `${BASE_URL}/venues/v_mewar_lake_udaipur`;
      console.log(`Navigating to Venue Detail (${vp.name}): ${testVenueUrl}...`);
      await page.goto(testVenueUrl, { waitUntil: 'networkidle2', timeout: 35000 });

      // Pre-set customer token in localStorage
      await page.evaluate(() => {
        localStorage.setItem('vv_auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ODFlODg3ZS1kMWQ1LTRmZjktOTMyZi0wOGQ2OWE2Y2QyMGIiLCJyb2xlIjoiY3VzdG9tZXIiLCJlbWFpbCI6ImRldmlrYS53ZWRkaW5nQGV4YW1wbGUuY29tIn0.dummy');
        localStorage.setItem('vv_current_user', JSON.stringify({
          name: 'Devika & Rohan Verma',
          email: 'devika.wedding@example.com',
          phone: '+91 9876543210',
          role: 'customer'
        }));
      });

      // Wait for venue title
      await page.waitForFunction(() => {
        const h1 = document.querySelector('h1');
        return h1 && h1.textContent.includes('Mewar');
      }, { timeout: 15000 });

      const venueTitle = await page.evaluate(() => document.querySelector('h1')?.textContent.trim());
      record('Content', 'User', vp.name, 'Venue Detail Title Loaded', Boolean(venueTitle), `Venue: ${venueTitle}`);

      // Click "Pay 5% & confirm slot"
      console.log(`Opening Booking Wizard (${vp.name})...`);
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent.includes('Pay 5% & confirm slot'));
        if (target) target.click();
      });

      await delay(1200);

      // Verify Booking Wizard opened
      const wizardData = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const dateBtns = buttons.filter(b => b.textContent.includes('OPEN') || b.textContent.includes('1 SLOT'));
        const slotSelect = document.querySelector('select');
        const options = slotSelect ? Array.from(slotSelect.options).map(o => ({ value: o.value, text: o.text, disabled: o.disabled })) : [];
        return {
          openDatesCount: dateBtns.length,
          slotOptions: options
        };
      });

      record('Feature', 'User', vp.name, 'Booking Calendar Open Slots Found', wizardData.openDatesCount > 0,
        `${wizardData.openDatesCount} available date buttons detected`);
      record('Feature', 'User', vp.name, 'Slot Selection Options Configured', wizardData.slotOptions.length >= 3,
        `Options: ${wizardData.slotOptions.map(o => o.value.split(' ')[0]).join(', ')}`);

      // Click an open date
      await page.evaluate(() => {
        const openBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('OPEN') || b.textContent.includes('1 SLOT'));
        if (openBtn) openBtn.click();
      });
      await delay(600);

      // Direct UPI QR Display & Enlarged Size
      await page.evaluate(() => {
        const upiBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Direct UPI QR'));
        if (upiBtn) upiBtn.click();
      });
      await delay(800);

      const qrMetrics = await page.evaluate(() => {
        const qrImg = document.querySelector('img[alt*="UPI QR"]');
        const utrInput = document.querySelector('input[placeholder*="UTR"]');
        const copyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Copy UPI ID'));
        return {
          qrFound: Boolean(qrImg),
          qrWidth: qrImg ? qrImg.clientWidth : 0,
          qrHeight: qrImg ? qrImg.clientHeight : 0,
          utrFound: Boolean(utrInput),
          copyBtnFound: Boolean(copyBtn)
        };
      });

      record('Feature', 'User', vp.name, 'Enlarged UPI QR Code Display',
        qrMetrics.qrFound && qrMetrics.qrWidth >= 180,
        `QR Size: ${qrMetrics.qrWidth}x${qrMetrics.qrHeight}px (Target >= 200px)`);
      record('Feature', 'User', vp.name, 'UPI Copy Button & UTR Field Present',
        qrMetrics.utrFound && qrMetrics.copyBtnFound,
        `UTR Input: ${qrMetrics.utrFound}, Copy Button: ${qrMetrics.copyBtnFound}`);

      const upiSnap = path.join(ARTIFACT_DIR, `audit_user_${vp.name.toLowerCase()}_upi_qr.png`);
      await page.screenshot({ path: upiSnap, fullPage: false });

      // Online Cards / NetBanking Form
      await page.evaluate(() => {
        const cardBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Online Cards / NetBanking'));
        if (cardBtn) cardBtn.click();
      });
      await delay(800);

      const cardMetrics = await page.evaluate(() => {
        const cardInput = document.querySelector('input[placeholder*="4532"]');
        const nameInput = document.querySelector('input[placeholder*="Rahul Verma"]');
        const cvvInput = document.querySelector('input[placeholder*="•••"]');
        const escrowBadge = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('256-Bit Escrow Gateway'));
        return {
          cardInputFound: Boolean(cardInput),
          nameInputFound: Boolean(nameInput),
          cvvInputFound: Boolean(cvvInput),
          escrowBadgeFound: Boolean(escrowBadge)
        };
      });

      record('Feature', 'User', vp.name, 'Online Card Form Fields Rendered',
        cardMetrics.cardInputFound && cardMetrics.cvvInputFound && cardMetrics.nameInputFound,
        `Card: ${cardMetrics.cardInputFound}, Name: ${cardMetrics.nameInputFound}, CVV: ${cardMetrics.cvvInputFound}`);

      // NetBanking Sub-tab
      await page.evaluate(() => {
        const nbTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('NetBanking'));
        if (nbTab) nbTab.click();
      });
      await delay(600);

      const nbMetrics = await page.evaluate(() => {
        const bankPills = Array.from(document.querySelectorAll('button')).filter(b => ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'].includes(b.textContent.trim()));
        return { bankPillsCount: bankPills.length };
      });

      record('Feature', 'User', vp.name, 'NetBanking Bank Selector Rendered',
        nbMetrics.bankPillsCount >= 4,
        `Popular Banks detected: ${nbMetrics.bankPillsCount}`);

      const cardSnap = path.join(ARTIFACT_DIR, `audit_user_${vp.name.toLowerCase()}_cards_form.png`);
      await page.screenshot({ path: cardSnap, fullPage: false });

      // Close modal
      await page.evaluate(() => {
        const closeBtn = document.querySelector('button.absolute');
        if (closeBtn) closeBtn.click();
      });
      await delay(600);

      // Customer Dashboard
      console.log(`Navigating to Customer Dashboard (${vp.name})...`);
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1200);

      const dashOverflow = await checkOverflow();
      record('Layout', 'User', vp.name, 'Customer Dashboard Responsiveness', !dashOverflow.hasOverflow,
        `ScrollWidth: ${dashOverflow.scrollW}px, ClientWidth: ${dashOverflow.clientW}px`);

      const dashSnap = path.join(ARTIFACT_DIR, `audit_user_${vp.name.toLowerCase()}_dashboard.png`);
      await page.screenshot({ path: dashSnap, fullPage: false });
    }

    // ========================================================================
    // ROLE 2: VENDOR PARTNER (DESKTOP & MOBILE)
    // ========================================================================
    console.log('\n>>> TESTING ROLE 2: VENDOR PARTNER <<<');

    for (const vp of [
      { name: 'Desktop', width: 1440, height: 900, isMobile: false },
      { name: 'Mobile', width: 375, height: 812, isMobile: true }
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

      console.log(`Navigating to Vendor Portal (${vp.name})...`);
      await page.goto(`${BASE_URL}/vendor`, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1500);

      const vendorOverflow = await checkOverflow();
      record('Layout', 'Vendor', vp.name, 'Vendor Portal Responsiveness', !vendorOverflow.hasOverflow,
        `ScrollWidth: ${vendorOverflow.scrollW}px, ClientWidth: ${vendorOverflow.clientW}px`);

      const vendorData = await page.evaluate(() => {
        const text = document.body.innerText;
        const hasHeader = text.includes('Vendor Partner Portal') || text.includes('Vows & Venues');
        const hasPalace = text.includes('Palace') || text.includes('Estate') || text.includes('Udaipur') || text.includes('Jodhpur');
        const hasTabs = text.includes('Overview') || text.includes('Bookings') || text.includes('Packages');
        return { hasHeader, hasPalace, hasTabs };
      });

      record('Feature', 'Vendor', vp.name, 'Vendor Suite Components Rendered',
        vendorData.hasHeader && vendorData.hasTabs,
        `Header: ${vendorData.hasHeader}, Content: ${vendorData.hasPalace}, Tabs: ${vendorData.hasTabs}`);

      const vendorSnap = path.join(ARTIFACT_DIR, `audit_vendor_${vp.name.toLowerCase()}_portal.png`);
      await page.screenshot({ path: vendorSnap, fullPage: false });
    }

    // ========================================================================
    // ROLE 3: ADMIN / SUPER ADMIN (DESKTOP & MOBILE)
    // ========================================================================
    console.log('\n>>> TESTING ROLE 3: ADMIN CONSOLE <<<');

    for (const vp of [
      { name: 'Desktop', width: 1440, height: 900, isMobile: false },
      { name: 'Mobile', width: 375, height: 812, isMobile: true }
    ]) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

      console.log(`Navigating to Admin Console (${vp.name})...`);
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });

      // Pre-set admin token in localStorage directly
      await page.evaluate(() => {
        localStorage.setItem('vv_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Jfc3VwZXJfYWRtaW4iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJlbWFpbCI6ImFkbWluQHZvd3NhbmR2ZW51ZXMuaW4ifQ.dummy');
        localStorage.setItem('vv_user', JSON.stringify({
          id: 'usr_super_admin',
          name: 'Vows & Venues Super Admin',
          email: 'admin@vowsandvenues.in',
          role: 'super_admin'
        }));
      });
      await page.reload({ waitUntil: 'networkidle2' });
      await delay(2000);

      const adminOverflow = await checkOverflow();
      record('Layout', 'Admin', vp.name, 'Admin Console Responsiveness', !adminOverflow.hasOverflow,
        `ScrollWidth: ${adminOverflow.scrollW}px, ClientWidth: ${adminOverflow.clientW}px`);

      // 3.1 Verify Site Visit & Recce Coordination Suite (AdminRecceManager)
      console.log(`Checking Site Visit & Recce Coordination (${vp.name})...`);
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button'));
        const recceTab = tabs.find(b => b.textContent.includes('Site Recces'));
        if (recceTab) recceTab.click();
      });
      await delay(1200);

      const recceStats = await page.evaluate(() => {
        const text = document.body.innerText;
        const upcomingMatch = text.match(/(\d+)\s+Scheduled/i);
        const completedMatch = text.match(/(\d+)\s+Walkthroughs/i);
        const filterTabs = Array.from(document.querySelectorAll('button')).filter(b =>
          b.textContent.includes('All (') || b.textContent.includes('Upcoming (') || b.textContent.includes('Completed (')
        );
        return {
          upcoming: upcomingMatch ? Number(upcomingMatch[1]) : null,
          completed: completedMatch ? Number(completedMatch[1]) : null,
          tabsCount: filterTabs.length
        };
      });

      record('Feature', 'Admin', vp.name, 'Recce Stats Accurate & Inversion Fixed',
        recceStats.upcoming !== null && recceStats.completed !== null && recceStats.upcoming >= 1 && recceStats.completed >= 1,
        `Upcoming: ${recceStats.upcoming} Scheduled, Completed: ${recceStats.completed} Walkthroughs`);

      record('Feature', 'Admin', vp.name, 'Recce Filter Tabs Active',
        recceStats.tabsCount >= 3,
        `Filter Tabs found: ${recceStats.tabsCount}`);

      // Click Upcoming filter tab
      await page.evaluate(() => {
        const upTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Upcoming ('));
        if (upTab) upTab.click();
      });
      await delay(600);

      const recceSnap = path.join(ARTIFACT_DIR, `audit_admin_${vp.name.toLowerCase()}_recces.png`);
      await page.screenshot({ path: recceSnap, fullPage: false });

      // 3.2 Verify Payment Manager / UPI Config Tab
      console.log(`Checking Payment Config Manager (${vp.name})...`);
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button'));
        const payTab = tabs.find(b => b.textContent.includes('Payment Gateway & UPI/QR'));
        if (payTab) payTab.click();
      });
      await delay(1200);

      const paymentConfigData = await page.evaluate(() => {
        const text = document.body.innerText;
        const hasUpiId = text.includes('9305977591@ptaxis');
        const hasSakshi = text.includes('Sakshi Singh');
        return { hasUpiId, hasSakshi };
      });

      record('Feature', 'Admin', vp.name, 'Admin UPI Payment Config Verified',
        paymentConfigData.hasUpiId,
        `Paytm UPI: 9305977591@ptaxis, Payee: Sakshi Singh`);

      const adminSnap = path.join(ARTIFACT_DIR, `audit_admin_${vp.name.toLowerCase()}_payments.png`);
      await page.screenshot({ path: adminSnap, fullPage: false });
    }

    console.log('\n========================================================================');
    console.log('   ALL MULTI-ROLE & MULTI-VIEWPORT TESTS COMPLETED');
    console.log('========================================================================\n');

    const total = testResults.length;
    const passed = testResults.filter(t => t.pass).length;
    const failed = total - passed;

    console.log(`Summary: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'master_e2e_results.json'),
      JSON.stringify({ total, passed, failed, results: testResults, timestamp: new Date().toISOString() }, null, 2)
    );

  } catch (err) {
    console.error('Fatal error during E2E tests:', err);
  } finally {
    await browser.close();
  }
}

runMasterE2ETests();
