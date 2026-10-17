const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

async function inspectBundles() {
  console.log('=== Inspecting Reference Bundles & Route Manifests ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const scriptUrls = [];
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('.js') && (url.includes('vowvenue.in') || url.includes('/_next/') || url.includes('/static/'))) {
      scriptUrls.push(url);
    }
  });

  await page.goto('https://vowvenue.in/', { waitUntil: 'networkidle2' });

  console.log(`Discovered ${scriptUrls.length} JS bundle URLs.`);

  const routePatterns = new Set();
  const apiEndpoints = new Set();
  const paymentKeywords = new Set();
  const keywordsToFind = ['booking', 'enquiry', 'payment', 'advance', 'razorpay', 'cashfree', 'paytm', 'stripe', 'upi', 'dashboard', 'vendor', 'admin', 'profile', 'cancel', 'reschedule'];

  for (const scriptUrl of scriptUrls) {
    try {
      const scriptContent = await page.evaluate(async (url) => {
        const r = await fetch(url);
        return await r.text();
      }, scriptUrl);

      // Search for routes
      const matches = scriptContent.matchAll(/"(\/[a-zA-Z0-9_\-\/\[\]]+)"/g);
      for (const m of matches) {
        const route = m[1];
        if (route.startsWith('/api/')) {
          apiEndpoints.add(route);
        } else if (
          route.startsWith('/venues') ||
          route.startsWith('/dashboard') ||
          route.startsWith('/booking') ||
          route.startsWith('/vendor') ||
          route.startsWith('/admin') ||
          route.startsWith('/profile') ||
          route.startsWith('/login') ||
          route.startsWith('/register') ||
          route.startsWith('/account') ||
          route.startsWith('/how-it-works') ||
          route.startsWith('/pricing')
        ) {
          routePatterns.add(route);
        }
      }

      for (const kw of keywordsToFind) {
        if (scriptContent.toLowerCase().includes(kw)) {
          paymentKeywords.add(kw);
        }
      }
    } catch (e) {
      console.log('Error fetching script', scriptUrl, e.message);
    }
  }

  const result = {
    discoveredFrontendRoutes: Array.from(routePatterns),
    discoveredApiEndpoints: Array.from(apiEndpoints),
    matchedKeywords: Array.from(paymentKeywords)
  };

  console.log('Bundle Analysis Result:', JSON.stringify(result, null, 2));

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'ref_vowvenue_bundle_analysis.json'),
    JSON.stringify(result, null, 2)
  );

  // Now let's try to inspect what happens on the venue page when clicking "Pay 5% & confirm slot"
  // Let's see if we can test registration with a mock test email to see the dashboard and booking flow
  await page.goto('https://vowvenue.in/venues/042de697-d3d2-4d1b-9da1-5182c2e4470e', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Extract all details of the booking card on this venue page:
  const bookingCardData = await page.evaluate(() => {
    // Find the right column card
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    const cardEl = document.querySelector('aside, [class*="sticky"], [class*="border rounded"]');
    return {
      buttons,
      cardText: cardEl ? cardEl.innerText : document.body.innerText.slice(0, 1500)
    };
  });

  console.log('Booking Card Data on Detail Page:', bookingCardData);

  await browser.close();
}

inspectBundles();
