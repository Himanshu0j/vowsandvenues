const fs = require('fs');

const files = [
  'app/page.js',
  'components/Navbar.jsx',
  'components/HeroSection.jsx',
  'components/CuratedOffers.jsx',
  'components/EditorialCategories.jsx',
  'components/VendorCard.jsx',
  'components/VendorProfileModal.jsx',
  'components/EventBuilderWorkspace.jsx',
  'components/AdminOperationsSuite.jsx',
  'components/FooterSection.jsx'
];

let issues = [];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    const lineNum = idx + 1;
    const trimmed = l.trim();
    if (trimmed.toLowerCase().includes('lorem ipsum')) {
      issues.push({ file: f, line: lineNum, type: 'LOREM_IPSUM', text: trimmed });
    }
    if (trimmed.includes('href="#"') || trimmed.includes("href='#'")) {
      issues.push({ file: f, line: lineNum, type: 'EMPTY_HASH_LINK', text: trimmed });
    }
    if (trimmed.startsWith('<button') && !trimmed.includes('onClick') && !trimmed.includes('type="submit"') && !trimmed.includes('disabled')) {
      // Check next 2 lines if onClick is on subsequent line
      const chunk = lines.slice(idx, idx + 4).join(' ');
      if (!chunk.includes('onClick') && !chunk.includes('type="submit"') && !chunk.includes('disabled')) {
        issues.push({ file: f, line: lineNum, type: 'UNHANDLED_BUTTON', text: trimmed });
      }
    }
  });
});

console.log('Total UI issues found:', issues.length);
issues.forEach(i => console.log(`[${i.type}] ${i.file}:${i.line} -> ${i.text}`));
