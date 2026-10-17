const target = process.argv[2] || '8ff2292';

async function poll() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('https://vowsandvenues-staging.onrender.com/api/health');
      const data = await res.json();
      const currentCommit = data.commit ? data.commit.slice(0, 7) : 'unknown';
      console.log(`[${new Date().toISOString()}] Current commit: ${currentCommit} (Target: ${target})`);
      if (data.commit && data.commit.startsWith(target)) {
        console.log('SUCCESS: Deployed commit matches target ' + target);
        process.exit(0);
      }
    } catch (e) {
      console.log('Error fetching health:', e.message);
    }
    await new Promise(r => setTimeout(r, 12000));
  }
  console.log('Timeout waiting for deployment');
  process.exit(1);
}

poll();
