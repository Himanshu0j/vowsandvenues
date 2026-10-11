const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';
const REF_URL = 'https://vow-iecp366.app.builtwithrocket.new/home';

async function deepInspect() {
  console.log('Launching browser to deeply inspect reference:', REF_URL);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Navigating to', REF_URL);
  await page.goto(REF_URL, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Detect libraries and animation mechanisms
  const libraries = await page.evaluate(() => {
    return {
      hasGSAP: typeof window.gsap !== 'undefined',
      hasScrollTrigger: typeof window.ScrollTrigger !== 'undefined',
      hasLenis: typeof window.Lenis !== 'undefined',
      hasAOS: typeof window.AOS !== 'undefined',
      hasFramerMotion: !!document.querySelector('[data-framer-name], [style*="will-change"]'),
      scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
      inlineStylesCount: document.querySelectorAll('style').length
    };
  });
  console.log('Detected libraries:', JSON.stringify(libraries, null, 2));

  // 2. Capture Hero initial state
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ref_scroll_0_hero.png') });
  console.log('Saved ref_scroll_0_hero.png');

  // 3. Inspect DOM elements with animation attributes or transition classes
  const animElements = await page.evaluate(() => {
    const els = document.querySelectorAll('*');
    const animated = [];
    els.forEach(el => {
      const style = window.getComputedStyle(el);
      const transition = style.transition;
      const animation = style.animation;
      const transform = style.transform;
      const willChange = style.willChange;
      if (
        (transition && transition !== 'all 0s ease 0s' && !transition.startsWith('none')) ||
        (animation && !animation.startsWith('none')) ||
        (willChange && willChange !== 'auto') ||
        el.getAttribute('data-scroll') ||
        el.getAttribute('data-aos') ||
        el.getAttribute('data-motion') ||
        (el.className && typeof el.className === 'string' && (el.className.includes('animate') || el.className.includes('motion') || el.className.includes('reveal') || el.className.includes('fade')))
      ) {
        if (animated.length < 50) {
          animated.push({
            tag: el.tagName,
            id: el.id,
            className: el.className.slice(0, 100),
            transition: transition.slice(0, 60),
            animation: animation.slice(0, 60),
            transform: transform !== 'none' ? transform : undefined,
            textSample: el.innerText ? el.innerText.trim().slice(0, 50) : ''
          });
        }
      }
    });
    return animated;
  });
  console.log('Sample animated elements in reference:', JSON.stringify(animElements.slice(0, 15), null, 2));

  // 4. Scroll down step-by-step and capture screenshots + inspect what changes
  const scrollSteps = [500, 1000, 1600, 2400, 3200, 4200, 5200];
  for (let i = 0; i < scrollSteps.length; i++) {
    const targetY = scrollSteps[i];
    console.log(`Scrolling to Y=${targetY}...`);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), targetY);
    await new Promise(r => setTimeout(r, 1200)); // wait for transition to play
    const snapPath = path.join(ARTIFACT_DIR, `ref_scroll_${targetY}.png`);
    await page.screenshot({ path: snapPath });
    console.log(`Saved screenshot at Y=${targetY}:`, snapPath);
  }

  // 5. Inspect total document height and section structure
  const pageStructure = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, main > div, div[class*="section"]')).map((s, idx) => {
      const rect = s.getBoundingClientRect();
      const style = window.getComputedStyle(s);
      return {
        idx,
        tag: s.tagName,
        className: (s.className || '').slice(0, 80),
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        headings: Array.from(s.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim().replace(/\n+/g, ' ')),
        overflow: style.overflow,
        position: style.position
      };
    });
    return {
      scrollHeight: document.body.scrollHeight,
      sections
    };
  });

  console.log('Reference Page Structure:');
  console.log(JSON.stringify(pageStructure, null, 2));

  await browser.close();
  console.log('Deep inspection complete!');
}

deepInspect().catch(console.error);
