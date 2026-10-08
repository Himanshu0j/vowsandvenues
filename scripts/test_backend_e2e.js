const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

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
  return { status: res.status, ok: res.ok, data };
}

async function runE2ETests() {
  const results = [];
  function record(category, testName, expectedStatus, actualStatus, pass, details = '') {
    results.push({ category, testName, expectedStatus, actualStatus, pass, details });
    const mark = pass ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] ${category} -> ${testName} (Got ${actualStatus}, expected ${expectedStatus}) ${details ? ':: ' + details : ''}`);
  }

  console.log('\n======================================================');
  console.log('1. RUNNING BACKEND API & INTEGRATION SUITE');
  console.log('======================================================\n');

  // --- HEALTH & METADATA ---
  {
    const r = await request('/api/health');
    record('Core', 'GET /api/health endpoint', 200, r.status, r.status === 200 && r.data?.status === 'healthy' && r.data?.database?.connected === true, `Type: ${r.data?.database?.type}, Env: ${r.data?.environment}`);
  }
  {
    const r = await request('/api/root');
    record('Core', 'GET /api/root health check', 200, r.status, r.status === 200 && r.data?.platform);
  }

  // --- CATEGORIES ---
  {
    const r = await request('/api/categories');
    record('Categories', 'GET /api/categories', 200, r.status, r.status === 200 && Array.isArray(r.data) && r.data.length >= 11, `Found ${r.data?.length} categories`);
  }

  // --- PACKAGES ---
  {
    const r = await request('/api/packages');
    record('Packages', 'GET /api/packages', 200, r.status, r.status === 200 && Array.isArray(r.data), `Found ${r.data?.length} packages`);
  }

  // --- VENDORS LIST & FILTERS ---
  {
    const rAll = await request('/api/vendors');
    record('Vendors', 'GET /api/vendors (All)', 200, rAll.status, rAll.status === 200 && rAll.data?.length > 0, `Total vendors: ${rAll.data?.length}`);

    const rCat = await request('/api/vendors?category=venues');
    const allVenues = rCat.data?.every(v => v.category === 'venues');
    record('Vendors', 'GET /api/vendors?category=venues', 200, rCat.status, rCat.status === 200 && allVenues, `Venues count: ${rCat.data?.length}`);

    const rCity = await request('/api/vendors?city=Lucknow');
    const allLko = rCity.data?.every(v => v.city === 'Lucknow');
    record('Vendors', 'GET /api/vendors?city=Lucknow', 200, rCity.status, rCity.status === 200 && allLko, `Lucknow vendors: ${rCity.data?.length}`);

    const rRating = await request('/api/vendors?minRating=4.8');
    const allHighRating = rRating.data?.every(v => v.rating >= 4.8);
    record('Vendors', 'GET /api/vendors?minRating=4.8', 200, rRating.status, rRating.status === 200 && allHighRating, `Top rated count: ${rRating.data?.length}`);

    const rVerified = await request('/api/vendors?verified=true');
    const allVerified = rVerified.data?.every(v => v.verified === true);
    record('Vendors', 'GET /api/vendors?verified=true', 200, rVerified.status, rVerified.status === 200 && allVerified, `Verified count: ${rVerified.data?.length}`);

    const rSearch = await request('/api/vendors?search=Palace');
    record('Vendors', 'GET /api/vendors?search=Palace', 200, rSearch.status, rSearch.status === 200 && rSearch.data?.length > 0, `Matching count: ${rSearch.data?.length}`);
  }

  // --- AUTHENTICATION & USERS ---
  let customerToken = null;
  let customerUser = null;
  let vendorToken = null;
  let vendorUser = null;
  let adminToken = null;
  let adminUser = null;

  const testEmail = `qa_customer_${Date.now()}@test.com`;
  const vendorEmail = `qa_vendor_${Date.now()}@test.com`;
  const adminEmail = `qa_admin_${Date.now()}@test.com`;

  {
    // Register Customer
    const rCust = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Himanshu Verma', email: testEmail, password: 'password123', role: 'customer' })
    });
    record('Auth', 'POST /api/auth/signup (Customer)', 201, rCust.status, rCust.status === 201 && rCust.data?.token, `User ID: ${rCust.data?.user?.id}`);
    customerToken = rCust.data?.token;
    customerUser = rCust.data?.user;

    // Login Customer
    const rLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    record('Auth', 'POST /api/auth/login (Customer)', 200, rLogin.status, rLogin.status === 200 && rLogin.data?.token);

    // Register Vendor
    const rVen = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Royal Mandap Studio', email: vendorEmail, password: 'password123', role: 'vendor' })
    });
    record('Auth', 'POST /api/auth/signup (Vendor)', 201, rVen.status, rVen.status === 201 && rVen.data?.token);
    vendorToken = rVen.data?.token;
    vendorUser = rVen.data?.user;

    // Register / Login Admin
    const rAdmLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@vowsandvenues.in', password: 'Admin@2026' })
    });
    if (rAdmLogin.status === 200 && rAdmLogin.data?.token) {
      adminToken = rAdmLogin.data.token;
      adminUser = rAdmLogin.data.user;
      record('Auth', 'Login seeded Super Admin', 200, 200, true, `Role: ${adminUser?.role}`);
    } else {
      const rAdm = await request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: 'Super Admin', email: `admin_${Date.now()}@vowsandvenues.in`, password: 'password123', role: 'admin' })
      });
      record('Auth', 'POST /api/auth/signup (Admin)', 201, rAdm.status, rAdm.status === 201 && rAdm.data?.token);
      adminToken = rAdm.data?.token;
      adminUser = rAdm.data?.user;
    }

    // Verify /api/auth/me
    const rMe = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    record('Auth', 'GET /api/auth/me with Bearer token', 200, rMe.status, rMe.status === 200 && rMe.data?.user?.email === testEmail);

    // Verify /api/auth/me without token
    const rMeAnon = await request('/api/auth/me');
    record('Auth', 'GET /api/auth/me without token', 401, rMeAnon.status, rMeAnon.status === 401);
  }

  // --- VENDOR ONBOARDING & KYC WORKFLOW ---
  let createdVendorId = null;
  {
    const payload = {
      name: 'Oudh Royal Caterers & Shahi Dawat',
      category: 'catering',
      categoryName: 'Catering & Feasts',
      city: 'Lucknow',
      address: 'Hazratganj, Lucknow',
      description: 'Centuries old traditional Awadhi Dum Pukht cuisine and Galouti kebabs for royal banquets.',
      contactPhone: '+91 9988776655',
      email: vendorEmail,
      startingPrice: 850,
      priceUnit: 'per plate',
      capacity: 1000,
      highlights: ['Authentic Awadhi Dum', 'Hygiene Grade A', 'Live Chaat counters'],
      gallery: ['https://images.unsplash.com/photo-1555244162-803834f70033']
    };

    // Anonymous posting should fail or vendor posting with token
    const rCreate = await request('/api/vendors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${vendorToken}` },
      body: JSON.stringify(payload)
    });
    createdVendorId = rCreate.data?.id;
    record('Vendor KYC', 'POST /api/vendors (Vendor onboarding registration)', 201, rCreate.status, rCreate.status === 201 && createdVendorId, `Created vendor ID: ${createdVendorId}`);

    // Verify it is pending verification initially
    const rGetVen = await request(`/api/vendors/${createdVendorId}`);
    record('Vendor KYC', 'GET /api/vendors/:id (Check initial verified status)', 200, rGetVen.status, rGetVen.status === 200 && rGetVen.data?.verified === false, `Verified: ${rGetVen.data?.verified}`);

    // Admin verifies vendor via PATCH /api/admin/vendors/:id/verify
    const rVerify = await request(`/api/admin/vendors/${createdVendorId}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ verified: true })
    });
    record('Vendor KYC', 'PATCH /api/admin/vendors/:id/verify (Admin approval)', 200, rVerify.status, rVerify.status === 200 && rVerify.data?.vendor?.verified === true, `Updated status: verified=${rVerify.data?.vendor?.verified}`);

    // Check customer attempting to verify vendor (RBAC test)
    const rCustVerify = await request(`/api/admin/vendors/${createdVendorId}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ verified: false })
    });
    record('RBAC', 'Customer attempting Admin vendor verification (Expected 403)', 403, rCustVerify.status, rCustVerify.status === 403);
  }

  // --- EVENT BUILDER CRUD ---
  let createdEventId = null;
  {
    const eventPayload = {
      name: 'Himanshu Wedding Celebration',
      eventType: 'Wedding',
      date: '2026-12-15',
      city: 'Lucknow',
      guestCount: 500,
      budget: 500000,
      selectedServices: [
        {
          category: 'venues',
          categoryName: 'Venues / Banquet Halls',
          vendorId: 'v_royal_palace_lko',
          vendorName: 'The Royal Nawabi Palace & Lawns',
          packageId: 'pkg_np_2',
          packageName: 'Royal Heritage Bundle',
          price: 165000
        },
        {
          category: 'catering',
          categoryName: 'Catering & Feasts',
          vendorId: createdVendorId || 'v_dastarkhwan_catering',
          vendorName: 'Oudh Royal Caterers',
          packageId: 'pkg_custom_cat',
          packageName: 'Grand Shahi Awadhi Dawat',
          price: 125000
        },
        {
          category: 'decor',
          categoryName: 'Decoration & Mandaps',
          vendorId: 'v_utsav_decor_lko',
          vendorName: 'Gulmohar Luxury Events',
          packageId: 'pkg_gd_1',
          packageName: 'Classic Floral Mandap',
          price: 45000
        },
        {
          category: 'photography',
          categoryName: 'Photography & Cinema',
          vendorId: 'v_drishti_cinema_lko',
          vendorName: 'Drishti Wedding Films',
          packageId: 'pkg_df_1',
          packageName: 'Complete Cinematic Teaser & 4K Photos',
          price: 55000
        },
        {
          category: 'makeup',
          categoryName: 'Makeup Artists',
          vendorId: 'v_glam_by_simran',
          vendorName: 'Glow & Glam by Simran Kaur',
          packageId: 'pkg_gs_1',
          packageName: 'Signature HD Bridal Glam',
          price: 18000
        }
      ]
    };

    const rEvt = await request('/api/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify(eventPayload)
    });
    createdEventId = rEvt.data?.id;
    record('Event Builder', 'POST /api/events (Create 5-service event plan)', 201, rEvt.status, rEvt.status === 201 && createdEventId, `Event ID: ${createdEventId}`);

    // GET /api/events
    const rGetEvt = await request('/api/events', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const foundEvent = rGetEvt.data?.find(e => e.id === createdEventId);
    record('Event Builder', 'GET /api/events (Fetch persisted customer event)', 200, rGetEvt.status, rGetEvt.status === 200 && !!foundEvent, `Services count: ${foundEvent?.selectedServices?.length}`);

    // Update Event (Modify budget & guest count)
    const rUpEvt = await request(`/api/events/${createdEventId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ guestCount: 550, budget: 550000 })
    });
    record('Event Builder', 'PUT /api/events/:id (Update event budget/guest count)', 200, rUpEvt.status, rUpEvt.status === 200 && rUpEvt.data?.guestCount === 550);
  }

  // --- COUPON VALIDATION & CALCULATIONS ---
  {
    // Test ROYAL2026: Flat 15000 off, minOrder 50000
    const rRoyalValid = await request('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'ROYAL2026', subtotal: 100000 })
    });
    record('Coupons', 'Apply ROYAL2026 above minOrder (100k)', 200, rRoyalValid.status, rRoyalValid.status === 200 && rRoyalValid.data?.discount === 15000, `Discount: ₹${rRoyalValid.data?.discount}`);

    // Test ROYAL2026 below minOrder (e.g. 20000)
    const rRoyalBelow = await request('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'ROYAL2026', subtotal: 20000 })
    });
    record('Coupons', 'Apply ROYAL2026 below minOrder threshold (Expected 400)', 400, rRoyalBelow.status, rRoyalBelow.status === 400, rRoyalBelow.data?.error);

    // Test SHUBH10: 10% off, maxDiscount 10000
    const rShubhValid = await request('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'SHUBH10', subtotal: 60000 })
    });
    // 10% of 60,000 = 6,000
    record('Coupons', 'Apply SHUBH10 (10% of 60k = 6k)', 200, rShubhValid.status, rShubhValid.status === 200 && rShubhValid.data?.discount === 6000, `Discount: ₹${rShubhValid.data?.discount}`);

    // Test SHUBH10 max discount cap (subtotal 250,000 -> 10% is 25k, capped at 20k per coupon terms)
    const rShubhCap = await request('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'SHUBH10', subtotal: 250000 })
    });
    record('Coupons', 'Apply SHUBH10 with maxDiscount cap (250k subtotal capped at 20k)', 200, rShubhCap.status, rShubhCap.status === 200 && rShubhCap.data?.discount === 20000, `Discount: ₹${rShubhCap.data?.discount}`);

    // Test Invalid coupon code
    const rInvalid = await request('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'FAKECODE999', subtotal: 100000 })
    });
    record('Coupons', 'Apply invalid non-existent coupon (Expected 404)', 404, rInvalid.status, rInvalid.status === 404, rInvalid.data?.error);
  }

  // --- BOOKING LIFECYCLE ---
  let createdBookingId = null;
  {
    const bookingPayload = {
      eventId: createdEventId,
      eventName: 'Himanshu Wedding Celebration',
      eventDate: '2026-12-15',
      city: 'Lucknow',
      guestCount: 500,
      venueAddress: 'The Royal Nawabi Palace, Gomti Nagar, Lucknow',
      customerName: 'Himanshu Verma',
      customerPhone: '+91 9876543210',
      customerEmail: testEmail,
      promoCode: 'ROYAL2026',
      items: [
        {
          vendorId: 'v_royal_palace_lko',
          vendorName: 'The Royal Nawabi Palace & Lawns',
          category: 'venues',
          categoryName: 'Venues / Banquet Halls',
          packageId: 'pkg_np_2',
          packageName: 'Royal Heritage Bundle',
          price: 165000
        },
        {
          vendorId: createdVendorId || 'v_dastarkhwan_catering',
          vendorName: 'Oudh Royal Caterers',
          category: 'catering',
          categoryName: 'Catering & Feasts',
          packageId: 'pkg_custom_cat',
          packageName: 'Grand Shahi Awadhi Dawat',
          price: 125000
        }
      ],
      totalAmount: 275000, // 165k + 125k = 290k - 15k discount = 275k
      advanceAmount: 68750, // 25% advance
      paymentMethod: 'upi',
      specialInstructions: 'Decor setup required by 2:00 PM.'
    };

    const rBook = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify(bookingPayload)
    });
    createdBookingId = rBook.data?.id;
    record('Bookings', 'POST /api/bookings (Create multi-vendor booking)', 201, rBook.status, rBook.status === 201 && createdBookingId, `Booking ID: ${createdBookingId}, Status: ${rBook.data?.status}`);

    // GET /api/bookings for Customer
    const rCustBkg = await request('/api/bookings', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const foundBkg = rCustBkg.data?.find(b => b.id === createdBookingId);
    record('Bookings', 'GET /api/bookings (Customer retrieves booking)', 200, rCustBkg.status, rCustBkg.status === 200 && !!foundBkg, `Items count: ${foundBkg?.items?.length}`);

    // Admin updates booking status to 'confirmed'
    const rConf = await request(`/api/bookings/${createdBookingId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'confirmed' })
    });
    record('Bookings', 'PUT /api/bookings/:id (Update status to confirmed)', 200, rConf.status, rConf.status === 200 && rConf.data?.status === 'confirmed');

    // Customer CANNOT modify other customer bookings (IDOR test)
    const otherCustomerEmail = `other_cust_${Date.now()}@test.com`;
    const rOtherCust = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Other User', email: otherCustomerEmail, password: 'password123', role: 'customer' })
    });
    const rIdor = await request(`/api/bookings/${createdBookingId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${rOtherCust.data?.token}` },
      body: JSON.stringify({ status: 'cancelled' })
    });
    record('RBAC & IDOR', 'Customer attempting to modify another user booking (Expected 403)', 403, rIdor.status, rIdor.status === 403);
  }

  // --- CMS CONTENT & DYNAMIC IMAGES ---
  {
    const rGetCms = await request('/api/cms');
    record('CMS', 'GET /api/cms (Fetch website content)', 200, rGetCms.status, rGetCms.status === 200 && rGetCms.data?.hero);

    // Update hero headline & image via Admin
    const updatePayload = {
      hero: {
        ...rGetCms.data?.hero,
        headline: 'Curated Indian Celebrations & Royal Palaces (QA Verified)',
        heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552'
      }
    };
    const rPutCms = await request('/api/cms', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(updatePayload)
    });
    record('CMS', 'PUT /api/cms via Admin', 200, rPutCms.status, rPutCms.status === 200 && rPutCms.data?.cms?.hero?.headline.includes('QA Verified'));

    // Customer attempting to update CMS (RBAC test)
    const rCustCms = await request('/api/cms', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ hero: { headline: 'Hacked Headline' } })
    });
    record('RBAC', 'Customer attempting Admin CMS update (Expected 403)', 403, rCustCms.status, rCustCms.status === 403);
  }

  // --- MEDIA ASSET LIBRARY ---
  let createdMediaId = null;
  {
    const rGetMedia = await request('/api/media');
    record('Media Library', 'GET /api/media', 200, rGetMedia.status, rGetMedia.status === 200 && Array.isArray(rGetMedia.data), `Existing assets: ${rGetMedia.data?.length}`);

    // Upload new image via Admin
    const mediaPayload = {
      title: 'QA Verified Palace Lawn',
      url: 'https://images.unsplash.com/photo-1544077960-604201fe74bc',
      altText: 'Royal palace banquet lawn evening illuminated',
      category: 'venues',
      caption: 'Main reception venue with lighting'
    };
    const rPostMedia = await request('/api/media', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(mediaPayload)
    });
    createdMediaId = rPostMedia.data?.media?.id;
    record('Media Library', 'POST /api/media (Admin uploads image asset)', 201, rPostMedia.status, rPostMedia.status === 201 && createdMediaId, `Media ID: ${createdMediaId}`);

    // Delete media asset via Admin
    const rDelMedia = await request(`/api/media/${createdMediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    record('Media Library', 'DELETE /api/media/:id (Admin deletes asset)', 200, rDelMedia.status, rDelMedia.status === 200);
  }

  // --- SETTLEMENTS & FINANCIAL LEDGER ---
  {
    // Admin gets settlements
    const rGetSet = await request('/api/settlements', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    record('Settlements', 'GET /api/settlements (Admin ledger access)', 200, rGetSet.status, rGetSet.status === 200 && Array.isArray(rGetSet.data));

    // Customer attempting to view settlements (RBAC test)
    const rCustSet = await request('/api/settlements', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    record('RBAC', 'Customer attempting Admin settlements access (Expected 403)', 403, rCustSet.status, rCustSet.status === 403);
  }

  // --- DISPUTE MANAGEMENT ---
  let createdDisputeId = null;
  {
    const rCreateDisp = await request('/api/disputes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        bookingId: createdBookingId,
        reason: 'Service Timing Adjustment Requested',
        description: 'Need decor arrival confirmed for 1:00 PM instead of 2:00 PM.'
      })
    });
    createdDisputeId = rCreateDisp.data?.dispute?.id;
    record('Disputes', 'POST /api/disputes (Customer logs dispute/issue)', 201, rCreateDisp.status, rCreateDisp.status === 201 && createdDisputeId, `Dispute ID: ${createdDisputeId}`);

    // Admin resolves dispute
    const rPatchDisp = await request(`/api/disputes/${createdDisputeId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'RESOLVED', resolutionNotes: 'Vendor confirmed 1:00 PM arrival' })
    });
    record('Disputes', 'PATCH /api/disputes/:id (Admin resolves dispute)', 200, rPatchDisp.status, rPatchDisp.status === 200 && rPatchDisp.data?.dispute?.status === 'RESOLVED');
  }

  // --- SUPPORT TICKETS ---
  let createdTicketId = null;
  {
    const rCreateTkt = await request('/api/support', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        subject: 'Inquiry regarding royal bridal lounge access',
        category: 'Venue Questions',
        priority: 'MEDIUM',
        message: 'Does the Royal Nawabi Palace provide air-conditioned green rooms for the bridal party?'
      })
    });
    createdTicketId = rCreateTkt.data?.ticket?.id;
    record('Support', 'POST /api/support (Customer creates support ticket)', 201, rCreateTkt.status, rCreateTkt.status === 201 && createdTicketId, `Ticket ID: ${createdTicketId}`);

    // Admin replies to ticket
    const rReplyTkt = await request(`/api/support/${createdTicketId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        replyMessage: 'Yes, 2 fully furnished AC bridal suites are included complimentary in your booking.',
        status: 'ANSWERED'
      })
    });
    record('Support', 'PATCH /api/support/:id (Admin replies to ticket)', 200, rReplyTkt.status, rReplyTkt.status === 200 && rReplyTkt.data?.ticket?.messages?.length >= 2);
  }

  // --- QUOTATIONS ---
  let createdQuoteId = null;
  {
    const rCreateQuote = await request('/api/quotes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        vendorId: createdVendorId || 'v_royal_palace_lko',
        eventDate: '2026-12-15',
        guests: 500,
        price: 150000,
        services: ['Main Banquet Hall', 'Lawn Access', 'Bridal Suite'],
        notes: 'Requesting quotation with valet parking included.'
      })
    });
    createdQuoteId = rCreateQuote.data?.quote?.id;
    record('Quotes', 'POST /api/quotes (Customer requests customized quotation)', 201, rCreateQuote.status, rCreateQuote.status === 201 && createdQuoteId, `Quote ID: ${createdQuoteId}`);

    // Vendor updates quote status
    const rPatchQuote = await request(`/api/quotes/${createdQuoteId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${vendorToken}` },
      body: JSON.stringify({ status: 'OFFERED', proposedPrice: 155000, vendorNotes: 'Includes valet for 100 cars' })
    });
    record('Quotes', 'PATCH /api/quotes/:id (Vendor sends quote offer)', 200, rPatchQuote.status, rPatchQuote.status === 200 && rPatchQuote.data?.quote?.status === 'OFFERED');
  }

  // --- REVIEWS & COMPLETED BOOKING RESTRICTION ---
  {
    // Try posting a review for a vendor
    const rRev = await request('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        vendorId: 'v_royal_palace_lko',
        rating: 5,
        comment: 'Absolutely magnificent palace with impeccable Nawabi hospitality and spotless lawn maintenance!',
        eventType: 'Wedding'
      })
    });
    record('Reviews', 'POST /api/reviews', 201, rRev.status, rRev.status === 201, `Review ID: ${rRev.data?.id}`);

    // GET /api/reviews
    const rGetRev = await request('/api/reviews?vendorId=v_royal_palace_lko');
    record('Reviews', 'GET /api/reviews?vendorId=v_royal_palace_lko', 200, rGetRev.status, rGetRev.status === 200 && Array.isArray(rGetRev.data));
  }

  // --- WISHLIST ---
  {
    const rWishToggle = await request('/api/wishlist/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ vendorId: 'v_royal_palace_lko' })
    });
    record('Wishlist', 'POST /api/wishlist/toggle (Add)', 200, rWishToggle.status, rWishToggle.status === 200 && rWishToggle.data?.isSaved === true);

    const rWishGet = await request('/api/wishlist', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    record('Wishlist', 'GET /api/wishlist', 200, rWishGet.status, rWishGet.status === 200 && rWishGet.data?.wishlistIds?.includes('v_royal_palace_lko'));
  }

  console.log('\n======================================================');
  console.log('API SUITE SUMMARY');
  console.log('======================================================');
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total tests: ${total} | Passed: ${passed} | Failed: ${failed}`);

  fs.writeFileSync('scripts/qa_api_results.json', JSON.stringify(results, null, 2));
  return { total, passed, failed, results };
}

runE2ETests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
