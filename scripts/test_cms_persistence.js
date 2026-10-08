const BASE_URL = 'http://localhost:3000';

async function testCMSPersistence() {
  console.log('\n--- TESTING CMS PERSISTENCE ---');
  
  // 1. Fetch current
  const rInitial = await fetch(`${BASE_URL}/api/cms`).then(r => r.json());
  console.log('1. Initial Headline:', rInitial?.hero?.headline);

  // 2. Update via Admin
  const newHeadline = `Royal Heritage Weddings & Celebrations (Audit Verified ${Date.now()})`;
  const putRes = await fetch(`${BASE_URL}/api/cms`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-demo-role': 'admin' },
    body: JSON.stringify({
      hero: {
        ...rInitial.hero,
        headline: newHeadline
      }
    })
  }).then(r => r.json());
  console.log('2. Updated Headline:', putRes?.cms?.hero?.headline);

  // 3. Verify immediate fetch
  const rVerify = await fetch(`${BASE_URL}/api/cms`).then(r => r.json());
  const matchImmediate = rVerify?.hero?.headline === newHeadline;
  console.log('3. Immediate Verification Match:', matchImmediate ? 'PASS' : 'FAIL');

  return { matchImmediate, newHeadline };
}

testCMSPersistence().catch(console.error);
