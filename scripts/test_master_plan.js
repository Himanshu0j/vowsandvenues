const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
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
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runMasterPlanTests() {
  console.log('================================================================');
  console.log('👑 VOWS & VENUES — MASTER EXECUTION PLAN TEST SUITE');
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assertTest(name, condition, details = '') {
    if (condition) {
      console.log(`[✓ PASS] ${name} ${details ? ':: ' + details : ''}`);
      passed++;
    } else {
      console.error(`[✗ FAIL] ${name} ${details ? ':: ' + details : ''}`);
      failed++;
    }
  }

  // 1. Authenticate as Super Admin
  let adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@vowsandvenues.in', password: process.env.ADMIN_PASSWORD || 'Vows#Stg2026!SecureKey' })
  });
  if (adminLogin.status !== 200) {
    adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@vowsandvenues.in', password: 'Admin@2026' })
    });
  }
  assertTest('1. Super Admin Authentication', adminLogin.status === 200 && adminLogin.data.token, `Role: ${adminLogin.data?.user?.role}`);
  const adminToken = adminLogin.data?.token;
  const authHeader = { Authorization: `Bearer ${adminToken}` };

  // 2. Health & DB
  const health = await request('/api/health');
  assertTest('2. Service & Database Health', health.status === 200 && health.data.status === 'healthy', `DB: ${health.data?.database?.name}`);

  // 3. Enriched Admin Stats (GMV, Cash Collected, Settlements)
  const stats = await request('/api/admin/stats', { headers: authHeader });
  assertTest(
    '3. Enriched Admin Operational Stats (Phase 5)',
    stats.status === 200 && stats.data.grossPlatformVolume !== undefined && stats.data.collectedCash !== undefined,
    `GMV: ₹${stats.data?.grossPlatformVolume?.toLocaleString('en-IN')}, Cash: ₹${stats.data?.collectedCash?.toLocaleString('en-IN')}`
  );

  // 4. Staff Team Management (Phase 4 RBAC)
  const testStaffEmail = `ops_${Date.now()}@vowsandvenues.in`;
  const createStaff = await request('/api/admin/users', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      name: 'Operations Lead Sharma',
      email: testStaffEmail,
      password: 'OpsPassword@2026',
      role: 'operations_manager'
    })
  });
  assertTest('4. Create Operational Staff User (operations_manager)', createStaff.status === 201, `Email: ${testStaffEmail}`);

  // 5. List Staff Users
  const staffList = await request('/api/admin/users', { headers: authHeader });
  assertTest('5. List Admin & Staff Team Members', staffList.status === 200 && Array.isArray(staffList.data?.users), `Count: ${staffList.data?.users?.length}`);

  // 6. Availability & Blackout Management (Phase 13)
  const vendorList = await request('/api/vendors');
  const targetVendor = vendorList.data?.[0] || { id: 'v_royal_palace_lko', name: 'The Royal Nawabi Palace' };
  const blackoutTestDate = '2026-12-25';

  const addBlackout = await request(`/api/vendors/${targetVendor.id}/blackout`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      dates: [blackoutTestDate],
      action: 'add'
    })
  });
  assertTest('6. Vendor Blackout Date Registration', addBlackout.status === 200 && addBlackout.data?.blackoutDates?.includes(blackoutTestDate), `Date: ${blackoutTestDate}`);

  // 7. Check Vendor Availability
  const checkAvail = await request(`/api/availability?vendorId=${targetVendor.id}`);
  assertTest(
    '7. GET /api/availability Query',
    checkAvail.status === 200 && checkAvail.data?.blackoutDates?.includes(blackoutTestDate),
    `Found blackout date: ${blackoutTestDate}`
  );

  // 8. Double-Booking Prevention: Attempt booking on blackout date
  const conflictBooking = await request('/api/bookings', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      eventDate: blackoutTestDate,
      eventName: 'Conflict Wedding Test',
      items: [{
        vendorId: targetVendor.id,
        vendorName: targetVendor.name,
        category: targetVendor.category || 'venues',
        price: 100000
      }]
    })
  });
  assertTest(
    '8. Collision Prevention: Reject Booking on Blackout Date (Expected 409 Conflict)',
    conflictBooking.status === 409 && conflictBooking.data?.code === 'DATE_BLACKOUT',
    `Status: ${conflictBooking.status}, Message: ${conflictBooking.data?.error}`
  );

  // Remove blackout date cleanup
  await request(`/api/vendors/${targetVendor.id}/blackout`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ dates: [blackoutTestDate], action: 'remove' })
  });

  // 9. SEO & Meta Tags Management (Phase 11)
  const seoGet = await request('/api/seo');
  assertTest('9. GET /api/seo Global Settings', seoGet.status === 200 && (seoGet.data?.siteName === 'Vows & Venues' || Boolean(seoGet.data?.defaultTitle)));

  const seoUpdate = await request('/api/seo', {
    method: 'PUT',
    headers: authHeader,
    body: JSON.stringify({
      defaultTitle: 'Vows & Venues | Premier Indian Wedding & Celebration Marketplace',
      canonicalBase: 'https://vowsandvenues.in'
    })
  });
  assertTest('10. PUT /api/seo Dynamic Meta Tag Update', seoUpdate.status === 200 && seoUpdate.data?.seo?.defaultTitle?.includes('Premier'));

  // 11. Idempotent Payout Settlement Execution (Phase 9)
  const settlementsRes = await request('/api/settlements', { headers: authHeader });
  const pendingSettlement = settlementsRes.data?.find(s => s.status === 'PENDING') || settlementsRes.data?.[0];

  if (pendingSettlement) {
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payout1 = await request(`/api/settlements/${pendingSettlement.id}/payout`, {
      method: 'POST',
      headers: { ...authHeader, 'x-idempotency-key': idempotencyKey },
      body: JSON.stringify({ referenceId: 'REF-BANK-UTR-991823' })
    });
    assertTest('11. First Payout Execution (Status 200)', payout1.status === 200 && payout1.data?.success === true, `Tx: ${payout1.data?.transaction?.idempotencyKey}`);

    // Replay same payout with exact same idempotency key
    const payout2 = await request(`/api/settlements/${pendingSettlement.id}/payout`, {
      method: 'POST',
      headers: { ...authHeader, 'x-idempotency-key': idempotencyKey },
      body: JSON.stringify({ referenceId: 'REF-BANK-UTR-991823' })
    });
    assertTest(
      '12. Idempotent Replay Rejection / Cache Hit',
      payout2.status === 200 && payout2.data?.message?.includes('Idempotent response'),
      `Replay safely handled: ${payout2.data?.message}`
    );
  } else {
    assertTest('11. Payout Execution (No settlements found)', false, 'No settlement in database');
    assertTest('12. Idempotent Replay (Skipped)', true);
  }

  // 13. Audit Log Trail Verification (Phase 4 & Phase 18)
  const auditLogs = await request('/api/admin/audit-logs', { headers: authHeader });
  assertTest(
    '13. GET /api/admin/audit-logs (Immutable Activity History)',
    auditLogs.status === 200 && Array.isArray(auditLogs.data?.logs) && auditLogs.data?.total > 0,
    `Logged Events Total: ${auditLogs.data?.total}`
  );

  console.log('\n================================================================');
  console.log(`TEST RESULTS: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterPlanTests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
