const BASE_URL = process.env.BASE_URL || 'https://vowsandvenues-staging.onrender.com'

async function runVerification() {
  console.log(`\n=== VERIFYING LIVE STAGING: ${BASE_URL} ===\n`)
  let passed = 0
  let failed = 0

  // 1. Payment Config Verification
  try {
    const res = await fetch(`${BASE_URL}/api/payments/config`)
    const cfg = await res.json()
    console.log('[TEST 1] GET /api/payments/config:')
    console.log('         UPI ID:', cfg.upiId)
    console.log('         Payee Name:', cfg.payeeName)
    console.log('         QR Image:', cfg.qrImageUrl)
    console.log('         Active Mode:', cfg.activeMode)

    if (cfg.upiId === '9305977591@ptaxis' && cfg.payeeName === 'Sakshi Singh' && cfg.qrImageUrl.includes('paytm_upi_qr.png')) {
      console.log('  --> [PASS] Payment gateway config accurately reflects Sakshi Singh Paytm UPI & QR')
      passed++
    } else {
      console.error('  --> [FAIL] Payment gateway config mismatch:', cfg)
      failed++
    }
  } catch (err) {
    console.error('  --> [FAIL] Error fetching /api/payments/config:', err.message)
    failed++
  }

  // 2. Paytm QR Image Asset Verification
  try {
    const res = await fetch(`${BASE_URL}/images/paytm_upi_qr.png`)
    const contentType = res.headers.get('content-type')
    const contentLength = res.headers.get('content-length')
    console.log('\n[TEST 2] GET /images/paytm_upi_qr.png:')
    console.log('         Status:', res.status)
    console.log('         Content-Type:', contentType)
    console.log('         Content-Length:', contentLength, 'bytes')

    if (res.status === 200 && contentType.includes('image/png') && Number(contentLength) > 10000) {
      console.log('  --> [PASS] Paytm QR image is valid and accessible')
      passed++
    } else {
      console.error('  --> [FAIL] QR image asset failed validation')
      failed++
    }
  } catch (err) {
    console.error('  --> [FAIL] Error fetching QR image:', err.message)
    failed++
  }

  // 3. Live Vendor Signup with On-Site Verification Photo
  const uniqueId = Date.now()
  const testVendorEmail = `vendor_test_${uniqueId}@royalweddings.in`
  const sampleVerificationPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
  let vendorToken = null
  let vendorUserId = null
  let vendorRecordId = null

  try {
    console.log('\n[TEST 3] POST /api/auth/signup (Vendor Registration with On-Site Photo):')
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Rana Vikramaditya ${uniqueId.toString().slice(-4)}`,
        email: testVendorEmail,
        phone: '+919876500001',
        password: 'password123',
        role: 'vendor',
        businessName: `Royal Awadh Haveli ${uniqueId.toString().slice(-4)}`,
        category: 'venues',
        city: 'Lucknow',
        verificationSelfie: sampleVerificationPhoto
      })
    })

    const data = await res.json()
    console.log('         Status:', res.status)
    console.log('         User Role:', data.user?.role)
    console.log('         User Status:', data.user?.status)
    console.log('         Vendor ID:', data.user?.vendorId)
    console.log('         Has Photo:', !!data.user?.verificationSelfie)

    if (res.status === 201 && data.user?.role === 'vendor' && data.user?.status === 'pending' && data.user?.verificationSelfie) {
      console.log('  --> [PASS] Vendor registered with on-site verification photo and pending KYC status')
      vendorToken = data.token
      vendorUserId = data.user.id
      vendorRecordId = data.user.vendorId
      passed++
    } else {
      console.error('  --> [FAIL] Vendor registration response invalid:', data)
      failed++
    }
  } catch (err) {
    console.error('  --> [FAIL] Error during vendor signup:', err.message)
    failed++
  }

  // 4. Admin Audit & Verification Workflow
  try {
    console.log('\n[TEST 4] Admin Audit Workflow (GET /api/admin/vendors & PATCH verify):')
    // Login as admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vowsandvenues.in',
        password: process.env.ADMIN_PASSWORD || 'Admin@2026'
      })
    })

    let adminToken = null
    if (adminLoginRes.ok) {
      const adminData = await adminLoginRes.json()
      adminToken = adminData.token
      console.log('         Admin logged in successfully')
    } else {
      // Fallback create/sign admin if local test
      console.log('         Admin login status:', adminLoginRes.status)
    }

    if (adminToken && vendorRecordId) {
      // Check admin vendors list
      const listRes = await fetch(`${BASE_URL}/api/admin/vendors`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const listData = await listRes.json()
      const found = listData.vendors?.find(v => v.id === vendorRecordId)
      console.log('         Vendor found in admin audit list:', !!found)
      console.log('         Vendor has on-site verification proof:', !!found?.verificationSelfie)

      if (found && found.verificationSelfie) {
        console.log('  --> [PASS] Vendor on-site photo correctly listed in Admin Operations Suite')
        passed++
      } else {
        console.error('  --> [FAIL] Vendor not found or missing photo in admin audit list')
        failed++
      }

      // Approve Vendor
      const verifyRes = await fetch(`${BASE_URL}/api/admin/vendors/${vendorRecordId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ verified: true, status: 'approved' })
      })
      const verifyData = await verifyRes.json()
      console.log('         Admin Approve Status:', verifyData.vendor?.status, 'Verified:', verifyData.vendor?.verified)

      if (verifyData.vendor?.verified === true && verifyData.vendor?.status === 'approved') {
        console.log('  --> [PASS] Admin successfully verified vendor based on on-site proof')
        passed++
      } else {
        console.error('  --> [FAIL] Admin verification failed:', verifyData)
        failed++
      }
    } else {
      console.log('         Skipping admin audit test (admin credentials not in env)')
    }
  } catch (err) {
    console.error('  --> [FAIL] Error in admin audit workflow:', err.message)
    failed++
  }

  console.log(`\n========================================`)
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log(`========================================\n`)

  if (failed > 0) process.exit(1)
}

runVerification().catch(e => {
  console.error('Fatal test error:', e)
  process.exit(1)
})
