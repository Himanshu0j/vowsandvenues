const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = process.env.TARGET_URL || 'https://vowsandvenues-staging.onrender.com';

const ROUTES = [
  { name: 'homepage', path: '/' },
  { name: 'venues_catalog', path: '/venues' },
  { name: 'venue_detail', path: '/venues/v_royal_palace_lko' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'vendor_portal', path: '/vendor' },
  { name: 'admin_portal', path: '/admin' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'how_it_works', path: '/how-it-works' },
  { name: 'pricing', path: '/pricing' }
];

async function auditSite() {
  console.log('\n======================================================');
  console.log(`STARTING SITE-WIDE COMPREHENSIVE UI & DEFECT AUDIT`);
  console.log(`Target: ${BASE_URL}`);
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const auditReport = [];

  for (const route of ROUTES) {
    console.log(`Auditing: ${route.name} (${route.path})...`);
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('requestfailed', req => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    try {
      // 1. Desktop Audit (1440x900)
      await page.setViewport({ width: 1440, height: 900, isMobile: false });
      const res = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 2000));

      const desktopSnap = path.join(ARTIFACT_DIR, `audit_desktop_${route.name}.png`);
      await page.screenshot({ path: desktopSnap, fullPage: false });

      // Inspect Page Health & DOM metrics
      const pageMetrics = await page.evaluate(() => {
        const bodyScroll = document.body.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        const allImgs = Array.from(document.querySelectorAll('img'));
        const brokenImgs = allImgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          tag: h.tagName,
          text: h.innerText.slice(0, 60).trim(),
          fontFamily: window.getComputedStyle(h).fontFamily
        }));
        const buttons = Array.from(document.querySelectorAll('button, a.btn, a[class*="btn"]')).map(b => b.innerText.trim()).filter(Boolean);

        return {
          title: document.title,
          scrollWidth: bodyScroll,
          clientWidth: clientW,
          hasHorizontalOverflow: bodyScroll > clientW,
          imgCount: allImgs.length,
          brokenImgCount: brokenImgs.length,
          brokenImgs: brokenImgs.slice(0, 5),
          headingsCount: headings.length,
          headingsSnippet: headings.slice(0, 5),
          buttonsCount: buttons.length,
          buttonsSnippet: buttons.slice(0, 8)
        };
      });

      // 2. Mobile Audit (390x844 - iPhone 14)
      await page.setViewport({ width: 390, height: 844, isMobile: true });
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 1500));

      const mobileSnap = path.join(ARTIFACT_DIR, `audit_mobile_${route.name}.png`);
      await page.screenshot({ path: mobileSnap, fullPage: false });

      const mobileMetrics = await page.evaluate(() => {
        const bodyScroll = document.body.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        return {
          scrollWidth: bodyScroll,
          clientWidth: clientW,
          hasHorizontalOverflow: bodyScroll > clientW
        };
      });

      auditReport.push({
        route: route.name,
        path: route.path,
        httpStatus: res ? res.status() : 'failed',
        desktopMetrics: pageMetrics,
        mobileMetrics: mobileMetrics,
        consoleErrors: consoleErrors.slice(0, 5),
        failedRequests: failedRequests.slice(0, 5)
      });

      console.log(`  -> HTTP ${res ? res.status() : 'failed'} | Desktop Overflow: ${pageMetrics.hasHorizontalOverflow ? 'FAIL' : 'PASS'} | Mobile Overflow: ${mobileMetrics.hasHorizontalOverflow ? 'FAIL' : 'PASS'}`);

    } catch (err) {
      console.error(`  Error auditing ${route.name}:`, err.message);
      auditReport.push({
        route: route.name,
        path: route.path,
        error: err.message
      });
    }
  }

  // Save JSON report
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'site_wide_initial_audit_report.json'),
    JSON.stringify(auditReport, null, 2)
  );

  console.log('\n======================================================');
  console.log(`AUDIT COMPLETE. Report saved to site_wide_initial_audit_report.json`);
  console.log('======================================================\n');

  await browser.close();
}

auditSite().catch(console.error);
