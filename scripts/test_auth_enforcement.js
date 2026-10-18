const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TARGET_URL || 'https://vowsandvenues-staging.onrender.com';
const ARTIFACT_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\1b435846-e4fd-4592-9481-1d2241c77612';

async function runAuthEnforcementTests() {
  console.log('\n================================================================');
  console.log('VOWS & VENUES — AUTH ENFORCEMENT & BOOKING ISOLATION TEST SUITE');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('================================================================\n');

  const results = [];
  const record = (id, name, pass, details = '') => {
    results.push({ id, name, pass, details });
    const mark = pass ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] Test #${id}: ${name} ${details ? ':: ' + details : ''}`);
  };

  const api = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      let data = null;
      try {
        data = await res.json();
      } catch (_) {}
      return { status: res.status, ok: res.ok, data };
    } catch (err) {
      return { status: 0, ok: false, error: err.message };
    }
  };

  // 1. Health check
  const health = await api('/api/health');
  record(1, 'Health Pre-Flight Check', health.status === 200, `Status: ${health.status}`);

  const testVenueId = 'v_royal_palace_lko';

  // 2. Anonymous POST /api/bookings -> must return 401
  const anonBookingPayload = {
    venueId: testVenueId,
    venueName: 'The Royal Nawabi Palace & Lawns',
    city: 'Lucknow',
    eventDate: '2026-12-25',
    timeSlot: 'Full Day (7 AM - Next Day 7 AM)',
    guestCount: 350,
    userName: 'Anonymous Hacker',
    userEmail: 'hacker@unauth.com',
    userPhone: '+91 9999999999',
    subtotal: 125000,
    totalAmount: 150000,
    advancePaid: 7500,
    paymentMethod: 'UPI'
  };

  const anonBookingRes = await api('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(anonBookingPayload)
  });
  record(
    2,
    'Anonymous POST /api/bookings Rejected with 401',
    anonBookingRes.status === 401,
    `HTTP ${anonBookingRes.status} (Expected 401), error: ${anonBookingRes.data?.error || 'N/A'}`
  );

  // 3. Anonymous POST /api/meetings -> must return 401
  const anonMeetingPayload = {
    venueId: testVenueId,
    venueName: 'The Royal Nawabi Palace & Lawns',
    date: '2026-12-20',
    time: '15:00',
    durationMinutes: 15,
    customerName: 'Anonymous Visitor',
    customerEmail: 'visitor@unauth.com'
  };

  const anonMeetingRes = await api('/api/meetings', {
    method: 'POST',
    body: JSON.stringify(anonMeetingPayload)
  });
  record(
    3,
    'Anonymous POST /api/meetings Rejected with 401',
    anonMeetingRes.status === 401,
    `HTTP ${anonMeetingRes.status} (Expected 401), error: ${anonMeetingRes.data?.error || 'N/A'}`
  );

  // 4. Anonymous GET /api/bookings -> must return 401
  const anonGetBookings = await api('/api/bookings');
  record(
    4,
    'Anonymous GET /api/bookings Rejected with 401',
    anonGetBookings.status === 401,
    `HTTP ${anonGetBookings.status} (Expected 401)`
  );

  // 5. Anonymous GET /api/meetings/my -> must return 401
  const anonGetMeetings = await api('/api/meetings/my');
  record(
    5,
    'Anonymous GET /api/meetings/my Rejected with 401',
    anonGetMeetings.status === 401,
    `HTTP ${anonGetMeetings.status} (Expected 401)`
  );

  // 6. Register Customer #1
  const cust1Email = `auth.test.user1.${Date.now()}@vowsandvenues.com`;
  const signup1 = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Aditi & Vikram Singhania',
      email: cust1Email,
      phone: '+91 98765 43210',
      password: 'RoyalWeddingPass2026!',
      role: 'customer'
    })
  });
  const token1 = signup1.data?.token;
  const user1 = signup1.data?.user;
  record(
    6,
    'Legitimate Customer #1 Signup & JWT Issuance',
    signup1.status === 201 && !!token1 && !!user1?.id,
    `User ID: ${user1?.id || 'N/A'}`
  );

  // 7. Authenticated POST /api/bookings with Customer #1 token
  // Pick a guaranteed unbooked date to prevent 409 collision
  const availRes = await api(`/api/bookings/availability/${testVenueId}`);
  const bookedSet = new Set((availRes.data?.bookedDates || []).concat(availRes.data?.blackoutDates || []));
  let candidateDay = 1;
  let authBookingDate = `2027-06-${String(candidateDay).padStart(2, '0')}`;
  while (bookedSet.has(authBookingDate)) {
    candidateDay++;
    authBookingDate = `2027-06-${String(candidateDay).padStart(2, '0')}`;
  }
  const authBookingPayload = {
    venueId: testVenueId,
    venueName: 'The Royal Nawabi Palace & Lawns',
    city: 'Lucknow',
    eventDate: authBookingDate,
    timeSlot: 'Full Day (7 AM - Next Day 7 AM)',
    guestCount: 500,
    userName: user1?.name || 'Aditi & Vikram Singhania',
    userEmail: cust1Email,
    userPhone: '+91 98765 43210',
    specialInstructions: 'Royal entrance with shahnai and marigold floral archway',
    advancePercent: 5,
    advancePaid: 7500,
    subtotal: 125000,
    totalAmount: 150000,
    paymentMethod: 'UPI',
    utrNumber: 'UTR-AUTH-TEST-998811'
  };

  const authBookingRes = await api('/api/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify(authBookingPayload)
  });

  const createdBooking = authBookingRes.data;
  record(
    7,
    'Authenticated POST /api/bookings with Valid Token Succeeds',
    authBookingRes.status === 201 && !!createdBooking?.id,
    `Booking ID: ${createdBooking?.bookingNumber || createdBooking?.id}, Status: ${createdBooking?.status}`
  );

  // 8. User ID Pinning Verification (ensure backend pinned userId: ctx.userId)
  const isUserIdPinned = createdBooking?.userId === user1?.id;
  record(
    8,
    'Booking userId Correctly Pinned to Authenticated Session (No Tampering)',
    isUserIdPinned,
    `Booking.userId: ${createdBooking?.userId} == User.id: ${user1?.id}`
  );

  // 9. Customer #1 GET /api/bookings returns their own booking
  const cust1Bookings = await api('/api/bookings', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  const hasOwnBooking = Array.isArray(cust1Bookings.data) && cust1Bookings.data.some(b => b.id === createdBooking?.id);
  record(
    9,
    'Customer #1 Can Retrieve Their Confirmed Booking in Dashboard',
    cust1Bookings.status === 200 && hasOwnBooking,
    `Total Bookings: ${cust1Bookings.data?.length || 0}`
  );

  // 10. Authenticated POST /api/meetings with Customer #1 token
  const authMeetingRes = await api('/api/meetings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      venueId: testVenueId,
      venueName: 'The Royal Nawabi Palace & Lawns',
      date: '2026-11-05',
      time: '14:30',
      durationMinutes: 15,
      message: 'Looking forward to meeting the palace manager for lawn inspection',
      customerName: user1?.name,
      customerEmail: cust1Email,
      customerPhone: '+91 98765 43210'
    })
  });
  const createdMeeting = authMeetingRes.data;
  record(
    10,
    'Authenticated POST /api/meetings with Valid Token Succeeds',
    authMeetingRes.status === 201 && !!createdMeeting?.id,
    `Meeting ID: ${createdMeeting?.id}`
  );

  // 11. Customer #1 GET /api/meetings/my retrieves their consultation
  const cust1Meetings = await api('/api/meetings/my', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  const hasOwnMeeting = Array.isArray(cust1Meetings.data) && cust1Meetings.data.some(m => m.id === createdMeeting?.id);
  record(
    11,
    'Customer #1 Can Retrieve Their Scheduled Consultations',
    cust1Meetings.status === 200 && hasOwnMeeting,
    `Total Meetings: ${cust1Meetings.data?.length || 0}`
  );

  // 12. Cross-Tenant Isolation: Customer #2 MUST NOT see Customer #1 bookings
  const cust2Email = `auth.test.user2.${Date.now()}@vowsandvenues.com`;
  const signup2 = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Rohan & Ananya Mehra',
      email: cust2Email,
      phone: '+91 91234 56789',
      password: 'RoyalWeddingPass2026!',
      role: 'customer'
    })
  });
  const token2 = signup2.data?.token;

  const cust2Bookings = await api('/api/bookings', {
    headers: { Authorization: `Bearer ${token2}` }
  });
  const leakFound = Array.isArray(cust2Bookings.data) && cust2Bookings.data.some(b => b.id === createdBooking?.id);
  record(
    12,
    'Cross-Tenant Booking Isolation (Customer #2 Cannot Access Customer #1 Bookings)',
    cust2Bookings.status === 200 && !leakFound,
    `Customer #2 sees ${cust2Bookings.data?.length || 0} bookings (0 leaked from Customer #1)`
  );

  // 13. Date Availability reflects newly confirmed booking date
  const updatedAvailRes = await api(`/api/bookings/availability/${testVenueId}`);
  const isDateMarkedBooked = (updatedAvailRes.data?.bookedDates || []).includes(authBookingDate);
  record(
    13,
    'Date Availability Dynamic Lock Verification',
    isDateMarkedBooked,
    `Date ${authBookingDate} is present in bookedDates: ${isDateMarkedBooked}`
  );

  // Summary
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log('\n================================================================');
  console.log(`AUTH ENFORCEMENT AUDIT COMPLETE: ${passed}/${total} PASSED (${((passed/total)*100).toFixed(1)}%)`);
  console.log('================================================================\n');

  // Save report artifact
  const reportPath = path.join(ARTIFACT_DIR, 'auth_enforcement_audit_report.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), baseUrl: BASE_URL, total, passed, results }, null, 2));
    console.log(`Saved report artifact: ${reportPath}`);
  } catch (_) {}

  return { passed, total, results };
}

runAuthEnforcementTests().then(({ passed, total }) => {
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
