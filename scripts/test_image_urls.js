const fs = require('fs');

async function testImageUrls() {
  console.log('\n--- TESTING IMAGE URL ACCESSIBILITY ---');

  const files = [
    '.local_db/categories.json',
    '.local_db/vendors.json',
    '.local_db/media_library.json',
    '.local_db/cms_content.json'
  ];

  const urls = new Set();

  files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const raw = fs.readFileSync(f, 'utf8');
    const matches = raw.match(/https:\/\/images\.unsplash\.com[^\s",]+/g) || [];
    matches.forEach(u => urls.add(u.replace(/\\/g, '')));
  });

  console.log(`Found ${urls.size} unique image URLs to check.`);

  let accessible = 0;
  let broken = 0;

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status === 302 || res.status === 301) {
        accessible++;
      } else {
        console.warn(`[BROKEN] Status ${res.status}: ${url}`);
        broken++;
      }
    } catch (e) {
      console.warn(`[ERROR] Failed to fetch: ${url} (${e.message})`);
      broken++;
    }
  }

  console.log(`\nImage Check Result: ${accessible} Accessible | ${broken} Broken`);
  return { accessible, broken, total: urls.size };
}

testImageUrls().catch(console.error);
