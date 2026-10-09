const BASE_URL = process.env.TARGET_URL || 'https://vowsandvenues-staging.onrender.com';

async function req(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (_) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runAdminSuite() {
  console.log('================================================================');
  console.log('👑 VOWS & VENUES — LIVE ADMIN PORTAL COMPREHENSIVE TEST SUITE');
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  let adminToken = null;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[✓ PASS] ${title} ${extra ? `:: ${extra}` : ''}`);
      passed++;
    } else {
      console.error(`[✗ FAIL] ${title} ${extra ? `:: ${extra}` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health & DB
    const h = await req('/api/health');
    assert('1. Service Health & Persistent MongoDB', h.status === 200 && h.data?.database?.connected, `DB: ${h.data?.database?.name}, Uptime: ${h.data?.uptime}s`);

    // 2. Direct Admin Routes HTTP Status
    const rAdminRoute = await fetch(`${BASE_URL}/admin`);
    assert('2. Direct /admin Route Response', rAdminRoute.status === 200, `Got HTTP ${rAdminRoute.status}`);

    const rAdminTab = await fetch(`${BASE_URL}/?tab=admin_portal`);
    assert('3. Direct /?tab=admin_portal Response', rAdminTab.status === 200, `Got HTTP ${rAdminTab.status}`);

    // 3. Super Admin Authentication
    console.log('\n--- 🔑 Super Admin Authentication ---');
    let loginRes = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vowsandvenues.in',
        password: process.env.ADMIN_PASSWORD || 'Vows#Stg2026!SecureKey'
      })
    });
    if (loginRes.status !== 200) {
      loginRes = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@vowsandvenues.in', password: 'Admin@2026' })
      });
    }
    assert('4. Admin Login with admin@vowsandvenues.in', loginRes.status === 200 && loginRes.data?.token, `User: ${loginRes.data?.user?.name}, Role: ${loginRes.data?.user?.role}`);
    adminToken = loginRes.data?.token;

    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // 4. Admin Profile Verification
    const meRes = await req('/api/auth/me', { headers: authHeaders });
    assert('5. GET /api/auth/me (Identity Check)', meRes.status === 200 && (meRes.data?.user?.role === 'admin' || meRes.data?.user?.role === 'super_admin'), `Role: ${meRes.data?.user?.role}, Email: ${meRes.data?.user?.email}`);

    // 5. Admin KPIs & Analytics
    console.log('\n--- 📊 Operations KPIs & Analytics ---');
    const statsRes = await req('/api/admin/stats', { headers: authHeaders });
    assert('6. GET /api/admin/stats (Live Operations Metrics)', statsRes.status === 200, 
      `Vendors: ${statsRes.data?.totalVendors}, Verified: ${statsRes.data?.totalVerifiedVendors}, Bookings: ${statsRes.data?.totalBookings}, GMV: ₹${Number(statsRes.data?.grossPlatformVolume || 0).toLocaleString('en-IN')}`);

    // 6. Vendor KYC Verification & Approval
    console.log('\n--- 🏢 Vendor Directory & KYC Management ---');
    const venRes = await req('/api/vendors');
    assert('7. GET /api/vendors (Vendor Catalog Access)', venRes.status === 200 && Array.isArray(venRes.data), `Found ${venRes.data?.length} vendors`);

    if (venRes.data && venRes.data.length > 0) {
      const targetVendor = venRes.data[0];
      const initialVerified = !!targetVendor.verified;

      // Toggle verification
      const verifyToggle = await req(`/api/admin/vendors/${targetVendor.id}/verify`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ verified: !initialVerified })
      });
      assert('8. PATCH /api/admin/vendors/:id/verify (Toggle KYC)', verifyToggle.status === 200, `Updated ${targetVendor.name} -> verified: ${!initialVerified}`);

      // Restore verification
      await req(`/api/admin/vendors/${targetVendor.id}/verify`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ verified: true })
      });
    }

    // 7. Bookings Management
    console.log('\n--- 📅 Bookings Oversight ---');
    const bkgRes = await req('/api/bookings', { headers: authHeaders });
    assert('9. GET /api/bookings (Admin Bookings View)', bkgRes.status === 200, `Found ${Array.isArray(bkgRes.data) ? bkgRes.data.length : 0} bookings`);

    // 8. Website CMS Editor
    console.log('\n--- 📝 Live CMS & Announcement Editor ---');
    const cmsGet = await req('/api/cms');
    assert('10. GET /api/cms (Fetch Live Website Content)', cmsGet.status === 200 && cmsGet.data?.hero, `Headline: "${cmsGet.data?.hero?.headline?.slice(0, 35)}..."`);

    const updatedCms = {
      ...cmsGet.data,
      hero: {
        ...(cmsGet.data?.hero || {}),
        badge: "India's Premier Luxury Wedding & Event Concierge"
      },
      announcement: {
        enabled: true,
        text: "✨ Royal Celebrations 2026: Complimentary Concierge Planning on All Bookings"
      }
    };
    const cmsPut = await req('/api/cms', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatedCms)
    });
    assert('11. PUT /api/cms (Admin Live Updates)', cmsPut.status === 200, `Saved live announcement banner`);

    // 9. Media Asset Library
    console.log('\n--- 🖼️ Media Asset Library ---');
    const mediaGet = await req('/api/media', { headers: authHeaders });
    assert('12. GET /api/media (Asset Catalog)', mediaGet.status === 200, `Found ${Array.isArray(mediaGet.data) ? mediaGet.data.length : 0} media assets`);

    const newMedia = {
      title: 'Royal Mandap Stage Decor 2026',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552',
      category: 'decor',
      altText: 'Grand Royal Mandap',
      caption: 'Heritage palace wedding set'
    };
    const mediaPost = await req('/api/media', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newMedia)
    });
    assert('13. POST /api/media (Upload Image Asset)', mediaPost.status === 201 && mediaPost.data?.media?.id, `Created asset ID: ${mediaPost.data?.media?.id}`);

    if (mediaPost.data?.media?.id) {
      const mediaDel = await req(`/api/media/${mediaPost.data.media.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert('14. DELETE /api/media/:id (Asset Cleanup)', mediaDel.status === 200, `Removed test asset`);
    }

    // 10. Financial Settlements & Ledger
    console.log('\n--- 💰 Finance & Vendor Settlements ---');
    const stlGet = await req('/api/settlements', { headers: authHeaders });
    assert('15. GET /api/settlements (Admin Financial Ledger)', stlGet.status === 200, `Found ${Array.isArray(stlGet.data) ? stlGet.data.length : 0} payout ledgers`);

    // 11. Promotional Coupons Management
    console.log('\n--- 🏷️ Promotional Discount Coupons ---');
    const testCouponCode = `TEST${Date.now().toString().slice(-4)}`;
    const cpPost = await req('/api/coupons', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        code: testCouponCode,
        discountType: 'fixed',
        discountValue: 12000,
        minOrder: 80000,
        maxDiscount: 15000,
        description: 'Automated test discount'
      })
    });
    assert('16. POST /api/coupons (Create Discount Code)', cpPost.status === 201, `Created coupon ${testCouponCode} for ₹12,000 off`);

    // 12. Security & RBAC Checks
    console.log('\n--- 🛡️ Security & Role-Based Access Control ---');
    const unauthStats = await req('/api/admin/stats');
    assert('17. RBAC Check: Anonymous Access to /api/admin/stats (Refused 401)', unauthStats.status === 401, `Status: ${unauthStats.status}`);

    const unauthCms = await req('/api/cms', {
      method: 'PUT',
      body: JSON.stringify({ hero: { headline: 'Hacked' } })
    });
    assert('18. RBAC Check: Unauthenticated CMS Mutation (Refused 401)', unauthCms.status === 401, `Status: ${unauthCms.status}`);

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminSuite();
