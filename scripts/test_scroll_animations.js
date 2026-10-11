const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function testScroll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- SCROLL OBSERVATION TEST ---');
  
  // Track specific sections
  const sectionPositions = [
    { name: 'Hero', y: 0 },
    { name: 'Scene II Royal Venue Reveal', y: 950 },
    { name: 'Signature Luxury Showcases (Palace 1)', y: 1900 },
    { name: 'Signature Luxury Showcases (Palace 2)', y: 2800 },
    { name: 'Explore by Craft Categories', y: 3800 },
    { name: 'Distinguished Palaces & Sanctuaries', y: 4700 },
    { name: 'Curated All-Inclusive Event Packages', y: 6200 },
    { name: 'Inspiration Gallery', y: 7200 },
  ];

  for (const sp of sectionPositions) {
    console.log(`Scrolling to ${sp.name} at Y=${sp.y}...`);
    // Scroll slightly before the section to catch entrance
    const beforeY = Math.max(0, sp.y - 400);
    await page.evaluate((y) => window.scrollTo(0, y), beforeY);
    await new Promise(r => setTimeout(r, 100));

    // Now scroll into section
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), sp.y);
    // Take immediate snapshot during transition
    await new Promise(r => setTimeout(r, 150));
    const duringPath = path.join(ARTIFACT_DIR, `scroll_during_${sp.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
    await page.screenshot({ path: duringPath });

    // Wait for transition to complete
    await new Promise(r => setTimeout(r, 1000));
    const afterPath = path.join(ARTIFACT_DIR, `scroll_after_${sp.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
    await page.screenshot({ path: afterPath });
    console.log(`Captured ${sp.name}`);
  }

  await browser.close();
  console.log('Scroll observation test complete.');
}

testScroll().catch(console.error);
