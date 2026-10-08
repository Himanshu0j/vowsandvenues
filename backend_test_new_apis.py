#!/usr/bin/env python3
"""
Backend test for newly added APIs:
1. Authentication APIs (Signup, Login, Google Mock, Me)
2. Admin Vendor Approval & Verification APIs
3. Vendor Self-Service Package Management APIs
4. Booking Status Update API
"""
import os
import requests
import uuid
import time

BASE = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://occasion-hub-39.preview.emergentagent.com').rstrip('/') + '/api'
s = requests.Session()
failures = []

def call(method, path, expected=200, **kwargs):
    """Make API call and check status code"""
    url = BASE + path
    try:
        r = s.request(method, url, timeout=25, **kwargs)
        status_ok = r.status_code == expected
        if not status_ok:
            failures.append(f'{method} {path}: expected {expected}, got {r.status_code} - {r.text[:300]}')
        try:
            data = r.json()
        except Exception:
            data = None
        print(('✅ PASS' if status_ok else '❌ FAIL'), method, path, r.status_code)
        return r, data
    except Exception as e:
        failures.append(f'{method} {path}: Exception - {str(e)}')
        print('❌ FAIL', method, path, 'Exception:', str(e))
        return None, None

def check(cond, msg):
    """Check condition and log result"""
    if not cond:
        failures.append(msg)
        print('❌ FAIL', msg)
    else:
        print('✅ PASS', msg)

print("=" * 80)
print("TESTING NEWLY ADDED BACKEND APIs")
print("=" * 80)

# ========================================================
# 1. AUTHENTICATION APIs
# ========================================================
print("\n" + "=" * 80)
print("1. TESTING AUTHENTICATION APIs")
print("=" * 80)

# Generate unique test data
test_email = f"test.user.{uuid.uuid4().hex[:8]}@vowsandvenues.com"
test_password = "SecurePass123!"
test_name = "Priya Sharma"

# Test 1.1: POST /api/auth/signup - successful signup
print("\n--- Test 1.1: POST /api/auth/signup (success) ---")
r, signup_data = call('POST', '/auth/signup', 201, json={
    'name': test_name,
    'email': test_email,
    'password': test_password,
    'role': 'customer'
})
if signup_data:
    check('user' in signup_data and 'token' in signup_data, 'Signup returns user and token')
    check(signup_data.get('user', {}).get('email') == test_email.lower(), 'Signup email matches (lowercase)')
    check(signup_data.get('user', {}).get('name') == test_name, 'Signup name matches')
    check(signup_data.get('user', {}).get('role') == 'customer', 'Signup role is customer')
    user_id = signup_data.get('user', {}).get('id')
    check(user_id is not None, 'Signup returns user ID')
else:
    print("❌ Signup failed - no data returned")
    user_id = None

# Test 1.2: POST /api/auth/signup - duplicate email (409)
print("\n--- Test 1.2: POST /api/auth/signup (duplicate email - 409) ---")
r, dup_data = call('POST', '/auth/signup', 409, json={
    'name': 'Another User',
    'email': test_email,
    'password': 'AnotherPass123'
})
if dup_data:
    check('error' in dup_data, 'Duplicate signup returns error message')

# Test 1.3: POST /api/auth/login - successful login
print("\n--- Test 1.3: POST /api/auth/login (success) ---")
r, login_data = call('POST', '/auth/login', 200, json={
    'email': test_email,
    'password': test_password
})
if login_data:
    check('user' in login_data and 'token' in login_data, 'Login returns user and token')
    check(login_data.get('user', {}).get('email') == test_email.lower(), 'Login email matches')

# Test 1.4: POST /api/auth/login - wrong password (401)
print("\n--- Test 1.4: POST /api/auth/login (wrong password - 401) ---")
r, wrong_pw = call('POST', '/auth/login', 401, json={
    'email': test_email,
    'password': 'WrongPassword123'
})
if wrong_pw:
    check('error' in wrong_pw, 'Wrong password returns error message')

# Test 1.5: POST /api/auth/google - mock Google OAuth (upsert)
print("\n--- Test 1.5: POST /api/auth/google (mock OAuth) ---")
google_email = f"google.user.{uuid.uuid4().hex[:8]}@gmail.com"
r, google_data = call('POST', '/auth/google', 200, json={
    'name': 'Rahul Kumar',
    'email': google_email
})
if google_data:
    check('user' in google_data and 'token' in google_data, 'Google auth returns user and token')
    check(google_data.get('user', {}).get('email') == google_email.lower(), 'Google email matches')
    check(google_data.get('user', {}).get('provider') == 'google', 'Provider is google')
    google_user_id = google_data.get('user', {}).get('id')

# Test 1.6: POST /api/auth/google - second call should return same user (upsert)
print("\n--- Test 1.6: POST /api/auth/google (upsert - same user) ---")
r, google_data2 = call('POST', '/auth/google', 200, json={
    'name': 'Rahul Kumar Updated',
    'email': google_email
})
if google_data2:
    check(google_data2.get('user', {}).get('id') == google_user_id, 'Google upsert returns same user ID')

# Test 1.7: GET /api/auth/me - get user by ID
print("\n--- Test 1.7: GET /api/auth/me (valid userId) ---")
if user_id:
    r, me_data = call('GET', f'/auth/me?userId={user_id}', 200)
    if me_data:
        check(me_data.get('user', {}).get('id') == user_id, 'Me endpoint returns correct user')
        check(me_data.get('user', {}).get('email') == test_email.lower(), 'Me endpoint email matches')

# Test 1.8: GET /api/auth/me - unknown user (returns null)
print("\n--- Test 1.8: GET /api/auth/me (unknown userId) ---")
r, me_unknown = call('GET', f'/auth/me?userId=unknown_user_id_12345', 200)
if me_unknown:
    check(me_unknown.get('user') is None, 'Unknown user returns null')

# ========================================================
# 2. ADMIN VENDOR APPROVAL & VERIFICATION APIs
# ========================================================
print("\n" + "=" * 80)
print("2. TESTING ADMIN VENDOR APPROVAL APIs")
print("=" * 80)

# Test 2.1: GET /api/admin/vendors - list all vendors
print("\n--- Test 2.1: GET /api/admin/vendors ---")
r, admin_vendors = call('GET', '/admin/vendors', 200)
if admin_vendors:
    vendors_list = admin_vendors.get('vendors', [])
    check(isinstance(vendors_list, list) and len(vendors_list) > 0, 'Admin vendors returns list')
    check(all('verified' in v for v in vendors_list), 'All vendors have verified field')
    # Pick a vendor for testing
    test_vendor = None
    for v in vendors_list:
        if v.get('id') == 'v_royal_palace_lko':
            test_vendor = v
            break
    if not test_vendor and vendors_list:
        test_vendor = vendors_list[0]
    
    if test_vendor:
        test_vendor_id = test_vendor['id']
        original_verified = test_vendor.get('verified', False)
        print(f"Using test vendor: {test_vendor_id} (verified={original_verified})")
    else:
        test_vendor_id = None
        print("❌ No vendors found for testing")
else:
    test_vendor_id = None

# Test 2.2: PATCH /api/admin/vendors/:id/verify - toggle verification
print("\n--- Test 2.2: PATCH /api/admin/vendors/:id/verify ---")
if test_vendor_id:
    # Set to verified=true
    r, verify_data = call('PATCH', f'/admin/vendors/{test_vendor_id}/verify', 200, json={
        'verified': True
    })
    if verify_data:
        updated_vendor = verify_data.get('vendor', {})
        check(updated_vendor.get('verified') == True, 'Vendor verified status updated to true')
        check(updated_vendor.get('status') in ['approved', 'pending'], 'Vendor status is approved or pending')
    
    # Set to verified=false
    r, unverify_data = call('PATCH', f'/admin/vendors/{test_vendor_id}/verify', 200, json={
        'verified': False
    })
    if unverify_data:
        updated_vendor = unverify_data.get('vendor', {})
        check(updated_vendor.get('verified') == False, 'Vendor verified status updated to false')

# Test 2.3: PATCH /api/admin/vendors/:id/reject - reject vendor
print("\n--- Test 2.3: PATCH /api/admin/vendors/:id/reject ---")
if test_vendor_id:
    r, reject_data = call('PATCH', f'/admin/vendors/{test_vendor_id}/reject', 200)
    if reject_data:
        rejected_vendor = reject_data.get('vendor', {})
        check(rejected_vendor.get('verified') == False, 'Rejected vendor has verified=false')
        check(rejected_vendor.get('status') == 'rejected', 'Rejected vendor has status=rejected')
    
    # Restore original state
    r, restore_data = call('PATCH', f'/admin/vendors/{test_vendor_id}/verify', 200, json={
        'verified': True
    })

# ========================================================
# 3. VENDOR SELF-SERVICE PACKAGE MANAGEMENT APIs
# ========================================================
print("\n" + "=" * 80)
print("3. TESTING VENDOR PACKAGE MANAGEMENT APIs")
print("=" * 80)

# Use v_royal_palace_lko as specified in the review request
vendor_id_for_packages = 'v_royal_palace_lko'

# Test 3.1: POST /api/vendors/:id/packages - add new package
print("\n--- Test 3.1: POST /api/vendors/:id/packages (add package) ---")
new_package = {
    'name': 'Exclusive Sangeet Night Package',
    'price': 185000,
    'includes': [
        'Full venue access for 500 guests',
        'Premium DJ and sound system',
        'Stage decoration with LED backdrop',
        'Complimentary 4 AC suites'
    ],
    'description': 'Perfect package for a memorable sangeet celebration with all amenities included.'
}
r, pkg_data = call('POST', f'/vendors/{vendor_id_for_packages}/packages', 201, json=new_package)
if pkg_data:
    added_package = pkg_data.get('package', {})
    check('id' in added_package, 'Added package has ID')
    check(added_package.get('name') == new_package['name'], 'Package name matches')
    check(added_package.get('price') == new_package['price'], 'Package price matches')
    check(isinstance(added_package.get('includes'), list), 'Package includes is a list')
    package_id_to_delete = added_package.get('id')
    
    # Verify vendor has the new package
    updated_vendor = pkg_data.get('vendor', {})
    check('packages' in updated_vendor, 'Vendor has packages array')
else:
    package_id_to_delete = None

# Test 3.2: POST /api/vendors/:id/packages - missing required fields (400)
print("\n--- Test 3.2: POST /api/vendors/:id/packages (missing fields - 400) ---")
r, pkg_error = call('POST', f'/vendors/{vendor_id_for_packages}/packages', 400, json={
    'description': 'Package without name and price'
})
if pkg_error:
    check('error' in pkg_error, 'Missing fields returns error message')

# Test 3.3: DELETE /api/vendors/:id/packages/:pkgId - remove package
print("\n--- Test 3.3: DELETE /api/vendors/:id/packages/:pkgId ---")
if package_id_to_delete:
    r, del_data = call('DELETE', f'/vendors/{vendor_id_for_packages}/packages/{package_id_to_delete}', 200)
    if del_data:
        updated_vendor = del_data.get('vendor', {})
        packages = updated_vendor.get('packages', [])
        package_ids = [p.get('id') for p in packages]
        check(package_id_to_delete not in package_ids, 'Package removed from vendor')

# ========================================================
# 4. BOOKING STATUS UPDATE API
# ========================================================
print("\n" + "=" * 80)
print("4. TESTING BOOKING STATUS UPDATE API")
print("=" * 80)

# First, create a test booking
print("\n--- Setup: Create test booking ---")
test_booking_user_id = f"usr_test_{uuid.uuid4().hex[:8]}"
test_booking = {
    'userId': test_booking_user_id,
    'userName': 'Anjali Verma',
    'userEmail': 'anjali.verma@example.com',
    'userPhone': '+91 98765 43210',
    'eventName': 'Anjali & Rohan Wedding',
    'eventDate': '2027-06-15',
    'city': 'Lucknow',
    'guestCount': 250,
    'items': [
        {'vendorId': 'v_royal_palace_lko', 'price': 125000, 'packageId': 'pkg_np_1'}
    ],
    'discount': 0,
    'isAdvanceOnly': True
}
r, booking_data = call('POST', '/bookings', 201, json=test_booking)
if booking_data:
    test_booking_id = booking_data.get('id')
    check(test_booking_id is not None, 'Test booking created')
    print(f"Test booking ID: {test_booking_id}")
else:
    test_booking_id = None
    print("❌ Failed to create test booking")

# Test 4.1: PATCH /api/bookings/:id/status - update to confirmed
print("\n--- Test 4.1: PATCH /api/bookings/:id/status (confirmed) ---")
if test_booking_id:
    r, status_data = call('PATCH', f'/bookings/{test_booking_id}/status', 200, json={
        'status': 'confirmed',
        'note': 'Booking confirmed by vendor. Looking forward to serving you!'
    })
    if status_data:
        updated_booking = status_data.get('booking', {})
        check(updated_booking.get('status') == 'confirmed', 'Booking status updated to confirmed')
        check('vendorNote' in updated_booking, 'Booking has vendor note')

# Test 4.2: Verify notification was created
print("\n--- Test 4.2: Verify notification created for booking status change ---")
if test_booking_id:
    time.sleep(1)  # Brief wait to ensure notification is created
    r, notifs = call('GET', f'/notifications?userId={test_booking_user_id}', 200)
    if notifs:
        check(isinstance(notifs, list) and len(notifs) > 0, 'Notifications exist for user')
        # Check if there's a booking_status notification
        booking_notifs = [n for n in notifs if n.get('type') == 'booking_status']
        check(len(booking_notifs) > 0, 'Booking status notification created')

# Test 4.3: PATCH /api/bookings/:id/status - update to declined
print("\n--- Test 4.3: PATCH /api/bookings/:id/status (declined) ---")
if test_booking_id:
    r, decline_data = call('PATCH', f'/bookings/{test_booking_id}/status', 200, json={
        'status': 'declined',
        'note': 'Sorry, venue not available on requested date.'
    })
    if decline_data:
        updated_booking = decline_data.get('booking', {})
        check(updated_booking.get('status') == 'declined', 'Booking status updated to declined')

# Test 4.4: PATCH /api/bookings/:id/status - update to completed
print("\n--- Test 4.4: PATCH /api/bookings/:id/status (completed) ---")
if test_booking_id:
    r, complete_data = call('PATCH', f'/bookings/{test_booking_id}/status', 200, json={
        'status': 'completed'
    })
    if complete_data:
        updated_booking = complete_data.get('booking', {})
        check(updated_booking.get('status') == 'completed', 'Booking status updated to completed')

# Test 4.5: PATCH /api/bookings/:id/status - update to cancelled
print("\n--- Test 4.5: PATCH /api/bookings/:id/status (cancelled) ---")
if test_booking_id:
    r, cancel_data = call('PATCH', f'/bookings/{test_booking_id}/status', 200, json={
        'status': 'cancelled',
        'note': 'Customer requested cancellation.'
    })
    if cancel_data:
        updated_booking = cancel_data.get('booking', {})
        check(updated_booking.get('status') == 'cancelled', 'Booking status updated to cancelled')

# Test 4.6: PATCH /api/bookings/:id/status - invalid status (400)
print("\n--- Test 4.6: PATCH /api/bookings/:id/status (invalid status - 400) ---")
if test_booking_id:
    r, invalid_status = call('PATCH', f'/bookings/{test_booking_id}/status', 400, json={
        'status': 'invalid_status_value'
    })
    if invalid_status:
        check('error' in invalid_status, 'Invalid status returns error message')

# ========================================================
# SUMMARY
# ========================================================
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"\nTotal failures: {len(failures)}")
if failures:
    print("\n❌ FAILURES FOUND:")
    for i, failure in enumerate(failures, 1):
        print(f"{i}. {failure}")
else:
    print("\n✅ ALL TESTS PASSED!")

print("\n" + "=" * 80)
raise SystemExit(1 if failures else 0)
