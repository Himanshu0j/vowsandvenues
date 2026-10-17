const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const BASE_URL = process.env.TARGET_URL || 'https://vowsandvenues-staging.onrender.com';

const VIEWPORTS = [
  { name: 'iPhone SE (320px)', width: 320, height: 568, isMobile: true },
  { name: 'Android Small (360px)', width: 360, height: 740, isMobile: true },
  { name: 'iPhone 8 (375px)', width: 375, height: 667, isMobile: true },
  { name: 'iPhone 13/14 (390px)', width: 390, height: 844, isMobile: true },
  { name: 'Pixel 7 (412px)', width: 412, height: 915, isMobile: true },
  { name: 'iPad Portrait (768px)', width: 768, height: 1024, isMobile: false },
  { name: 'iPad Landscape (1024px)', width: 1024, height: 768, isMobile: false },
  { name: 'Desktop HD (1280px)', width: 1280, height: 800, isMobile: false },
  { name: 'Desktop Full HD (1440px)', width: 1440, height: 900, isMobile: false },
  { name: 'Ultra-wide 1080p (1920px)', width: 1920, height: 1080, isMobile: false }
];

async function runBrowserTests() {
  console.log('\n======================================================');
  console.log(`RUNNING REAL BROWSER AUTOMATION & 10-VIEWPORT AUDIT`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const viewportResults = [];

  try {
    // 1. Audit Responsive Viewports on Homepage & Venues Page
    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
      
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 35000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      const overflowData = await page.evaluate(() => {
        const bodyScroll = document.body.scrollWidth;
        const bodyClient = document.documentElement.clientWidth;
        return {
          scrollWidth: bodyScroll,
          clientWidth: bodyClient,
          hasHorizontalOverflow: bodyScroll > bodyClient
        };
      });

      const snapPath = path.join(ARTIFACT_DIR, `parity_vp_${vp.width}_home.png`);
      await page.screenshot({ path: snapPath, fullPage: false });

      viewportResults.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        scrollWidth: overflowData.scrollWidth,
        clientWidth: overflowData.clientWidth,
        hasHorizontalOverflow: overflowData.hasHorizontalOverflow,
        pass: !overflowData.hasHorizontalOverflow
      });

      console.log(`  -> Overflow: ${overflowData.hasHorizontalOverflow ? 'FAIL (Horizontal Overflow)' : 'PASS (Clean)'}`);
    }

    // 2. Test Customer Discovery: Search on Homepage -> Navigate to /venues
    console.log('\nTesting Homepage Search to /venues navigation...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Fill search or click Explore
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a, button')).find(b => b.innerText.includes('Explore Directory') || b.innerText.includes('Browse Venues'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log('Current URL after click:', page.url());

    // Screenshot venues catalog
    const venuesCatalogPath = path.join(ARTIFACT_DIR, 'parity_venues_catalog_live.png');
    await page.screenshot({ path: venuesCatalogPath, fullPage: false });

    // 3. Test Venue Detail Page
    console.log('\nTesting Venue Details & Booking Card...');
    await page.goto(`${BASE_URL}/venues/v_royal_palace_lko`, { waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const venuePageData = await page.evaluate(() => {
      return {
        title: document.title,
        hasBookingCard: !!document.querySelector('button:has-text("Pay 5%"), [class*="border-amber"]'),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean).slice(0, 15)
      };
    });
    console.log('Venue Page Data:', venuePageData);

    const venueDetailSnap = path.join(ARTIFACT_DIR, 'parity_venue_detail_live.png');
    await page.screenshot({ path: venueDetailSnap, fullPage: false });

    // 4. Test Customer Dashboard Page
    console.log('\nTesting Customer Dashboard Page (/dashboard)...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const dashData = await page.evaluate(() => {
      return {
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()),
        tabs: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.includes('Bookings') || t.includes('Meetings') || t.includes('Profile'))
      };
    });
    console.log('Dashboard Data:', dashData);

    const dashboardSnap = path.join(ARTIFACT_DIR, 'parity_dashboard_live.png');
    await page.screenshot({ path: dashboardSnap, fullPage: false });

    // 5. Test Pricing and How it Works Pages
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'parity_pricing_live.png') });

    await page.goto(`${BASE_URL}/how-it-works`, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'parity_how_it_works_live.png') });

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'parity_browser_viewports_result.json'),
      JSON.stringify(viewportResults, null, 2)
    );

    console.log('\nAll browser and viewport checks completed successfully!');

  } catch (err) {
    console.error('Browser testing error:', err);
  } finally {
    await browser.close();
  }
}

runBrowserTests().catch(console.error);
