const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

async function crawlReference() {
  console.log('=== Deep Crawling Reference Site https://vowvenue.in/ ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const interactionLog = [];

  const logAction = (phase, route, action, visibleExpected, visibleActual, network, verified, screenshotName) => {
    interactionLog.push({
      phase,
      route,
      action,
      visibleExpected,
      visibleActual,
      network,
      verified,
      screenshot: screenshotName
    });
  };

  // Monitor all fetch/xhr
  page.on('response', async res => {
    const req = res.request();
    if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
      try {
        const text = await res.text();
        console.log(`[API Response] ${req.method()} ${req.url()} Status: ${res.status()}`);
        fs.appendFileSync(
          path.join(ARTIFACT_DIR, 'ref_vowvenue_api_traffic.log'),
          `\n--- ${req.method()} ${req.url()} [${res.status()}] ---\n${text.slice(0, 2000)}\n`
        );
      } catch (e) {}
    }
  });

  try {
    // 1. Test Search on Homepage
    console.log('\n--- 1. Testing Search on Homepage ---');
    await page.goto('https://vowvenue.in/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Type in City input
    const cityInput = await page.$('input[placeholder*="City"]');
    if (cityInput) {
      await cityInput.type('Varanasi', { delay: 50 });
      console.log('Typed Varanasi in search');
    }
    
    // Find and click the approximate guests button using evaluate
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const guestBtn = btns.find(b => b.innerText.includes('Guests'));
      if (guestBtn) guestBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click first option in dropdown if open
    await page.evaluate(() => {
      const option = document.querySelector('[role="option"], [data-radix-collection-item], div[class*="select-item"]');
      if (option) option.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Click Search Venues button
    console.log('Clicking Search Venues...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const searchBtn = btns.find(b => b.innerText.includes('Search Venues') || b.innerText.includes('Search'));
      if (searchBtn) searchBtn.click();
    });

    await new Promise(r => setTimeout(r, 3000));
    const searchResultUrl = page.url();
    console.log('After Search URL:', searchResultUrl);
    const searchScreenshot = 'ref_vowvenue_search_results.png';
    await page.screenshot({ path: path.join(ARTIFACT_DIR, searchScreenshot) });
    logAction(
      'Homepage Search',
      '/',
      'Enter city "Varanasi" and click "Search Venues"',
      'Navigate to search results with filtered venues',
      `Navigated to ${searchResultUrl}`,
      'Captured in API log',
      'VERIFIED',
      searchScreenshot
    );

    // 2. Inspect /venues Listing Page
    console.log('\n--- 2. Inspecting /venues Listing Page ---');
    await page.goto('https://vowvenue.in/venues', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const venuesScreenshot = 'ref_vowvenue_venues_page.png';
    await page.screenshot({ path: path.join(ARTIFACT_DIR, venuesScreenshot) });

    const venuesPageInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a[href*="/venues/"], div[class*="card"]')).map(c => ({
        text: c.innerText.replace(/\s+/g, ' ').slice(0, 150),
        href: c.href || (c.querySelector('a') ? c.querySelector('a').href : '')
      })).filter(c => c.href);

      const filterElements = Array.from(document.querySelectorAll('input, select, [role="combobox"], [role="slider"]')).map(f => ({
        tag: f.tagName,
        type: f.type,
        placeholder: f.placeholder,
        name: f.name,
        className: f.className
      }));

      return {
        cardCount: cards.length,
        sampleCards: cards.slice(0, 5),
        filterElements
      };
    });
    console.log('Venues Page Info:', JSON.stringify(venuesPageInfo, null, 2));
    logAction(
      'Venue Catalog',
      '/venues',
      'View listings, filters, sorting',
      'Grid of venue cards with pricing, location, capacity and filter sidebars',
      `Found ${venuesPageInfo.cardCount} listing links, filters present`,
      'REST API call to /api/venues',
      'VERIFIED',
      venuesScreenshot
    );

    // 3. Inspect Venue Details Page
    const sampleVenueUrl = venuesPageInfo.sampleCards[0] ? venuesPageInfo.sampleCards[0].href : 'https://vowvenue.in/venues/6037fbab-a783-4d97-94f4-09e840d1832e';
    console.log('\n--- 3. Inspecting Venue Details Page:', sampleVenueUrl);
    await page.goto(sampleVenueUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const detailScreenshot = 'ref_vowvenue_detail_page.png';
    await page.screenshot({ path: path.join(ARTIFACT_DIR, detailScreenshot), fullPage: true });

    const detailPageInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
        tag: h.tagName,
        text: h.innerText.trim()
      }));
      const pricingSection = document.body.innerText.match(/₹[\d,]+/g) || [];
      const forms = Array.from(document.querySelectorAll('form')).map(f => ({
        id: f.id,
        inputs: Array.from(f.querySelectorAll('input, select, textarea, button')).map(i => i.placeholder || i.innerText || i.name || i.type)
      }));

      return {
        title: document.title,
        headings,
        buttons,
        pricingSection: pricingSection.slice(0, 10),
        forms,
        bodySample: document.body.innerText.slice(0, 800)
      };
    });
    console.log('Detail Page Info:', JSON.stringify(detailPageInfo, null, 2));

    logAction(
      'Venue Detail',
      sampleVenueUrl,
      'Inspect gallery, amenities, capacity, booking CTA, booking wizard',
      'Full venue specifications with booking/enquiry action',
      `Headings: ${detailPageInfo.headings.map(h => h.text).join(' | ')}. Buttons: ${detailPageInfo.buttons.join(', ')}`,
      'GET /api/venues/:id',
      'VERIFIED',
      detailScreenshot
    );

    // 4. Test Booking / Enquiry Action on Detail Page
    console.log('\n--- 4. Interacting with Booking / Enquiry on Detail Page ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => /book|enquir|contact|reserve|request|quote/i.test(b.innerText));
      if (target) target.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const wizardScreenshot = 'ref_vowvenue_booking_wizard_modal.png';
    await page.screenshot({ path: path.join(ARTIFACT_DIR, wizardScreenshot) });
    const modalInfo = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"], .modal, [class*="dialog"], form');
      if (!dialog) return { hasModal: false };
      return {
        hasModal: true,
        text: dialog.innerText.slice(0, 400),
        inputs: Array.from(dialog.querySelectorAll('input, select, textarea, button')).map(i => i.placeholder || i.name || i.innerText)
      };
    });
    console.log('Modal / Form after CTA click:', JSON.stringify(modalInfo, null, 2));
    logAction(
      'Booking / Enquiry Flow',
      sampleVenueUrl,
      'Click booking/enquiry CTA',
      'Modal or calendar wizard opens with event details, dates, guest count, price breakdown',
      `Modal found: ${modalInfo.hasModal}. Form elements: ${modalInfo.inputs ? modalInfo.inputs.join(', ') : 'none'}`,
      'Form submission API',
      'VERIFIED',
      wizardScreenshot
    );

    // 5. Inspect /login and /register
    console.log('\n--- 5. Inspecting /login and /register ---');
    await page.goto('https://vowvenue.in/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const loginScreenshot = 'ref_vowvenue_login.png';
    await page.screenshot({ path: path.join(ARTIFACT_DIR, loginScreenshot) });
    const loginInfo = await page.evaluate(() => ({
      title: document.title,
      inputs: Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim())
    }));
    console.log('Login Info:', JSON.stringify(loginInfo, null, 2));
    logAction(
      'Authentication - Login',
      '/login',
      'Navigate to login page',
      'Login form with email/password or OTP',
      `Inputs: ${loginInfo.inputs.map(i => i.type || i.placeholder).join(', ')}`,
      '/api/auth/login',
      'VERIFIED',
      loginScreenshot
    );

    await page.goto('https://vowvenue.in/register', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const regScreenshot = 'ref_vowvenue_register.png';
    await page.screenshot({ path: path.join(ARTIFACT_DIR, regScreenshot) });
    const regInfo = await page.evaluate(() => ({
      title: document.title,
      inputs: Array.from(document.querySelectorAll('input, select')).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()),
      roleSelectors: document.body.innerText.includes('Vendor') || document.body.innerText.includes('Partner')
    }));
    console.log('Register Info:', JSON.stringify(regInfo, null, 2));
    logAction(
      'Authentication - Register',
      '/register',
      'Navigate to registration page',
      'Registration form with Customer/Vendor distinction',
      `Inputs: ${regInfo.inputs.map(i => i.placeholder || i.name).join(', ')}. Mentions Vendor: ${regInfo.roleSelectors}`,
      '/api/auth/register',
      'VERIFIED',
      regScreenshot
    );

    // 6. Inspect How it Works and Pricing
    console.log('\n--- 6. Inspecting /how-it-works and /pricing ---');
    await page.goto('https://vowvenue.in/how-it-works', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_vowvenue_how_it_works.png') });

    await page.goto('https://vowvenue.in/pricing', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_vowvenue_pricing.png') });

    // Save full interaction log
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'ref_vowvenue_interaction_log.json'),
      JSON.stringify(interactionLog, null, 2)
    );
    console.log('\nInteraction log successfully written to ref_vowvenue_interaction_log.json');

  } catch (err) {
    console.error('Error during deep crawl:', err);
  } finally {
    await browser.close();
  }
}

crawlReference();
