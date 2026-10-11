const fs = require('fs');

async function run() {
  const r = await fetch('https://vow-iecp366.app.builtwithrocket.new/home');
  const html = await r.text();
  const cssMatches = html.match(/href="[^"]+\.css[^"]*"/g) || [];
  console.log('CSS Matches:', cssMatches);
  for (const m of cssMatches) {
    const href = m.slice(6, -1);
    const url = href.startsWith('http') ? href : 'https://vow-iecp366.app.builtwithrocket.new' + href;
    const res = await fetch(url);
    const css = await res.text();
    console.log(url, 'Length:', css.length);
    const kf = css.match(/@keyframes[^{]+/g) || [];
    console.log('Keyframes:', kf);
  }
}

run().catch(console.error);
