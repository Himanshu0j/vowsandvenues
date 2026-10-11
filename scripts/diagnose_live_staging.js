const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const TARGET_URL = 'https://vowsandvenues-staging.onrender.com/';

async function diagnoseLiveStaging() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Listen for console logs and errors
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check if framer-motion elements exist and what their styles are
  const diagnostics = await page.evaluate(() => {
    const motionElements = document.querySelectorAll('[style*="transform"], [style*="opacity"]');
    const reveals = document.querySelectorAll('*');
    
    // Find all elements rendered by ScrollReveal
    const scrollRevealNodes = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.getAttribute('data-projection-id')) {
        scrollRevealNodes.push({
          tag: el.tagName,
          classes: (el.className || '').slice(0, 60),
          transform: window.getComputedStyle(el).transform,
          opacity: window.getComputedStyle(el).opacity
        });
      }
    });

    return {
      motionElementsCount: motionElements.length,
      projectionNodesCount: scrollRevealNodes.length,
      sampleProjectionNodes: scrollRevealNodes.slice(0, 10),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  });

  console.log('Live Diagnostics:', JSON.stringify(diagnostics, null, 2));

  await browser.close();
}

diagnoseLiveStaging().catch(console.error);
