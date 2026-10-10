const fs = require('fs');
const https = require('https');

const content = fs.readFileSync('./lib/imageAssetLibrary.js', 'utf8');
const urls = Array.from(new Set(content.match(/https:\/\/[^'\"\s]+/g) || []));
console.log('Found ' + urls.length + ' unique URLs in imageAssetLibrary.js');

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
      resolve({ url: url.slice(0, 60), status: res.statusCode, location: res.headers['location'] });
    }).on('error', (e) => resolve({ url: url.slice(0, 60), status: 'ERR' }))
      .on('timeout', () => resolve({ url: url.slice(0, 60), status: 'TIMEOUT' }));
  });
}

async function run() {
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(res.status + ' : ' + res.url + (res.location ? ' -> ' + res.location.slice(0, 40) : ''));
  }
}
run();
