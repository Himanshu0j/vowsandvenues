#!/usr/bin/env python3
"""
Backend Test Suite: Anonymous Homepage Crash Fix Verification
Tests the bug fix for null-deref crash when API returns null for unauthenticated visitors.
"""

import requests
import time
import json
from datetime import datetime

BASE_URL = "https://occasion-hub-39.preview.emergentagent.com/api"
DB_NAME = "your_database_name"

# Test results tracking
results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    results["tests"].append({"name": name, "passed": passed, "details": details})
    if passed:
        results["passed"] += 1
    else:
        results["failed"] += 1
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")

def test_section(title):
    """Print test section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

# ============================================================================
# A) REPRODUCE ANONYMOUS-VISITOR STATE (401s for protected endpoints)
# ============================================================================
test_section("A) Anonymous Visitor State - Protected Endpoints Return 401")

# A1: GET /api/wishlist without auth → 401
try:
    res = requests.get(f"{BASE_URL}/wishlist", timeout=10)
    log_test(
        "A1: GET /wishlist (no auth) → 401",
        res.status_code == 401,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("A1: GET /wishlist (no auth) → 401", False, f"Error: {str(e)}")

# A2: GET /api/events without auth → 401
try:
    res = requests.get(f"{BASE_URL}/events", timeout=10)
    log_test(
        "A2: GET /events (no auth) → 401",
        res.status_code == 401,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("A2: GET /events (no auth) → 401", False, f"Error: {str(e)}")

# A3: GET /api/bookings without auth → 401
try:
    res = requests.get(f"{BASE_URL}/bookings", timeout=10)
    log_test(
        "A3: GET /bookings (no auth) → 401",
        res.status_code == 401,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("A3: GET /bookings (no auth) → 401", False, f"Error: {str(e)}")

# A4: GET /api/notifications without auth → 401
try:
    res = requests.get(f"{BASE_URL}/notifications", timeout=10)
    log_test(
        "A4: GET /notifications (no auth) → 401",
        res.status_code == 401,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("A4: GET /notifications (no auth) → 401", False, f"Error: {str(e)}")

# A5: GET /api/admin/stats without auth → 401
try:
    res = requests.get(f"{BASE_URL}/admin/stats", timeout=10)
    log_test(
        "A5: GET /admin/stats (no auth) → 401",
        res.status_code == 401,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("A5: GET /admin/stats (no auth) → 401", False, f"Error: {str(e)}")

# A6: GET /api/vendor/stats without auth → 401
try:
    res = requests.get(f"{BASE_URL}/vendor/stats", timeout=10)
    log_test(
        "A6: GET /vendor/stats (no auth) → 401",
        res.status_code == 401,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("A6: GET /vendor/stats (no auth) → 401", False, f"Error: {str(e)}")

# ============================================================================
# B) PUBLIC ENDPOINTS MUST WORK WITHOUT AUTH
# ============================================================================
test_section("B) Public Endpoints - Must Work Without Auth")

# B1: GET /api/root → 200
try:
    res = requests.get(f"{BASE_URL}/root", timeout=10)
    log_test(
        "B1: GET /root → 200",
        res.status_code == 200,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("B1: GET /root → 200", False, f"Error: {str(e)}")

# B2: GET /api/categories → 200 with array length ≥ 10
try:
    res = requests.get(f"{BASE_URL}/categories", timeout=10)
    data = res.json() if res.status_code == 200 else []
    passed = res.status_code == 200 and isinstance(data, list) and len(data) >= 10
    log_test(
        "B2: GET /categories → 200 with ≥10 categories",
        passed,
        f"Status: {res.status_code}, Count: {len(data) if isinstance(data, list) else 0}"
    )
except Exception as e:
    log_test("B2: GET /categories → 200 with ≥10 categories", False, f"Error: {str(e)}")

# B3: GET /api/vendors → 200 with array length ≥ 32
try:
    res = requests.get(f"{BASE_URL}/vendors", timeout=10)
    data = res.json() if res.status_code == 200 else []
    passed = res.status_code == 200 and isinstance(data, list) and len(data) >= 32
    vendor_count = len(data) if isinstance(data, list) else 0
    log_test(
        "B3: GET /vendors → 200 with ≥32 vendors",
        passed,
        f"Status: {res.status_code}, Count: {vendor_count}"
    )
    # Store first vendor ID for next test
    first_vendor_id = data[0]['id'] if data and len(data) > 0 else None
except Exception as e:
    log_test("B3: GET /vendors → 200 with ≥32 vendors", False, f"Error: {str(e)}")
    first_vendor_id = None

# B4: GET /api/vendors/:id → 200 with vendor object
if first_vendor_id:
    try:
        res = requests.get(f"{BASE_URL}/vendors/{first_vendor_id}", timeout=10)
        data = res.json() if res.status_code == 200 else {}
        passed = res.status_code == 200 and isinstance(data, dict) and 'id' in data
        log_test(
            "B4: GET /vendors/:id → 200 with vendor object",
            passed,
            f"Status: {res.status_code}, Vendor: {data.get('name', 'N/A')}"
        )
    except Exception as e:
        log_test("B4: GET /vendors/:id → 200 with vendor object", False, f"Error: {str(e)}")
else:
    log_test("B4: GET /vendors/:id → 200 with vendor object", False, "No vendor ID available")

# B5: GET /api/packages → 200 with array
try:
    res = requests.get(f"{BASE_URL}/packages", timeout=10)
    data = res.json() if res.status_code == 200 else []
    passed = res.status_code == 200 and isinstance(data, list)
    log_test(
        "B5: GET /packages → 200 with array",
        passed,
        f"Status: {res.status_code}, Count: {len(data) if isinstance(data, list) else 0}"
    )
except Exception as e:
    log_test("B5: GET /packages → 200 with array", False, f"Error: {str(e)}")

# ============================================================================
# C) AUTH END-TO-END (bcrypt + JWT + role)
# ============================================================================
test_section("C) Auth End-to-End - bcrypt + JWT + Role")

# C1: POST /api/auth/signup → 201 + user + JWT
timestamp = int(time.time())
signup_email = f"crash-fix-test-{timestamp}@vv.in"
signup_password = "secure123"
signup_name = f"Test User {timestamp}"
jwt_token = None
user_id = None

try:
    res = requests.post(
        f"{BASE_URL}/auth/signup",
        json={
            "name": signup_name,
            "email": signup_email,
            "password": signup_password,
            "role": "customer"
        },
        timeout=10
    )
    data = res.json() if res.status_code in [200, 201] else {}
    passed = res.status_code == 201 and 'user' in data and 'token' in data
    if passed:
        jwt_token = data.get('token')
        user_id = data.get('user', {}).get('id')
    log_test(
        "C1: POST /auth/signup → 201 + user + JWT",
        passed,
        f"Status: {res.status_code}, User: {data.get('user', {}).get('name', 'N/A')}"
    )
except Exception as e:
    log_test("C1: POST /auth/signup → 201 + user + JWT", False, f"Error: {str(e)}")

# C2: POST /api/auth/login with same creds → 200 + JWT
try:
    res = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": signup_email,
            "password": signup_password
        },
        timeout=10
    )
    data = res.json() if res.status_code == 200 else {}
    passed = res.status_code == 200 and 'token' in data
    if passed and not jwt_token:
        jwt_token = data.get('token')
    log_test(
        "C2: POST /auth/login → 200 + JWT",
        passed,
        f"Status: {res.status_code}"
    )
except Exception as e:
    log_test("C2: POST /auth/login → 200 + JWT", False, f"Error: {str(e)}")

# C3: GET /api/events WITH Bearer JWT → 200 array
if jwt_token:
    try:
        res = requests.get(
            f"{BASE_URL}/events",
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=10
        )
        data = res.json() if res.status_code == 200 else []
        passed = res.status_code == 200 and isinstance(data, list)
        log_test(
            "C3: GET /events WITH Bearer → 200 array",
            passed,
            f"Status: {res.status_code}, Count: {len(data) if isinstance(data, list) else 0}"
        )
    except Exception as e:
        log_test("C3: GET /events WITH Bearer → 200 array", False, f"Error: {str(e)}")
else:
    log_test("C3: GET /events WITH Bearer → 200 array", False, "No JWT token available")

# C4: GET /api/wishlist WITH Bearer JWT → 200 with {wishlistIds: [], vendors: []}
if jwt_token:
    try:
        res = requests.get(
            f"{BASE_URL}/wishlist",
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=10
        )
        data = res.json() if res.status_code == 200 else {}
        passed = (
            res.status_code == 200 and 
            isinstance(data, dict) and 
            'wishlistIds' in data and 
            'vendors' in data and
            isinstance(data.get('wishlistIds'), list) and
            isinstance(data.get('vendors'), list)
        )
        log_test(
            "C4: GET /wishlist WITH Bearer → 200 with {wishlistIds: [], vendors: []}",
            passed,
            f"Status: {res.status_code}, Structure: {list(data.keys()) if isinstance(data, dict) else 'N/A'}"
        )
    except Exception as e:
        log_test("C4: GET /wishlist WITH Bearer → 200 with {wishlistIds: [], vendors: []}", False, f"Error: {str(e)}")
else:
    log_test("C4: GET /wishlist WITH Bearer → 200 with {wishlistIds: [], vendors: []}", False, "No JWT token available")

# C5: GET /api/admin/stats WITH customer Bearer → 403
if jwt_token:
    try:
        res = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": f"Bearer {jwt_token}"},
            timeout=10
        )
        passed = res.status_code == 403
        log_test(
            "C5: GET /admin/stats WITH customer Bearer → 403",
            passed,
            f"Status: {res.status_code}"
        )
    except Exception as e:
        log_test("C5: GET /admin/stats WITH customer Bearer → 403", False, f"Error: {str(e)}")
else:
    log_test("C5: GET /admin/stats WITH customer Bearer → 403", False, "No JWT token available")

# ============================================================================
# D) RATE LIMITING STILL ACTIVE
# ============================================================================
test_section("D) Rate Limiting - 6 Rapid Failed Logins → 429")

# D1: Blast 6 rapid POST /api/auth/login with wrong password → 429
rate_limit_hit = False
retry_after_header = None
try:
    for i in range(1, 7):
        res = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": signup_email,
                "password": "wrongpassword123"
            },
            timeout=10
        )
        print(f"   Attempt {i}: Status {res.status_code}")
        if res.status_code == 429:
            rate_limit_hit = True
            retry_after_header = res.headers.get('Retry-After')
            break
        time.sleep(0.2)  # Small delay between requests
    
    log_test(
        "D1: 6 rapid failed logins → at least one 429",
        rate_limit_hit,
        f"Rate limit hit: {rate_limit_hit}, Retry-After: {retry_after_header}"
    )
except Exception as e:
    log_test("D1: 6 rapid failed logins → at least one 429", False, f"Error: {str(e)}")

# ============================================================================
# E) GOOGLE AUTH STILL GATED (503 when not configured)
# ============================================================================
test_section("E) Google Auth - 503 When Not Configured")

# E1: POST /api/auth/google {} → 503
try:
    res = requests.post(
        f"{BASE_URL}/auth/google",
        json={},
        timeout=10
    )
    data = res.json() if res.status_code == 503 else {}
    passed = res.status_code == 503 and 'not configured' in str(data.get('error', '')).lower()
    log_test(
        "E1: POST /auth/google {} → 503 with 'not configured'",
        passed,
        f"Status: {res.status_code}, Error: {data.get('error', 'N/A')}"
    )
except Exception as e:
    log_test("E1: POST /auth/google {} → 503 with 'not configured'", False, f"Error: {str(e)}")

# ============================================================================
# F) CORS STILL CORRECT
# ============================================================================
test_section("F) CORS - Edge Test")

# F1: OPTIONS /api/root with evil origin → fallback ACAO (not *)
try:
    res = requests.options(
        f"{BASE_URL}/root",
        headers={"Origin": "https://evil.example.com"},
        timeout=10
    )
    acao = res.headers.get('Access-Control-Allow-Origin', '')
    passed = acao != '*' and acao != '' and 'vowsandvenues.in' in acao
    log_test(
        "F1: OPTIONS /root with evil origin → ACAO fallback (not *)",
        passed,
        f"Status: {res.status_code}, ACAO: {acao}"
    )
except Exception as e:
    log_test("F1: OPTIONS /root with evil origin → ACAO fallback (not *)", False, f"Error: {str(e)}")

# F2: OPTIONS /api/root with allowed origin → ACAO reflected + credentials
try:
    res = requests.options(
        f"{BASE_URL}/root",
        headers={"Origin": "https://vowsandvenues.in"},
        timeout=10
    )
    acao = res.headers.get('Access-Control-Allow-Origin', '')
    credentials = res.headers.get('Access-Control-Allow-Credentials', '')
    passed = acao == 'https://vowsandvenues.in' and credentials == 'true'
    log_test(
        "F2: OPTIONS /root with allowed origin → ACAO reflected + credentials",
        passed,
        f"Status: {res.status_code}, ACAO: {acao}, Credentials: {credentials}"
    )
except Exception as e:
    log_test("F2: OPTIONS /root with allowed origin → ACAO reflected + credentials", False, f"Error: {str(e)}")

# ============================================================================
# G) DATA PRESERVATION
# ============================================================================
test_section("G) Data Preservation - Vendors ≥ 32, Reviews ≥ 4")

# G1: Check vendor count via mongosh
try:
    import subprocess
    result = subprocess.run(
        [
            'mongosh', '--quiet', '--eval',
            f'db=db.getSiblingDB("{DB_NAME}"); print("vendors:", db.vendors.countDocuments(), "reviews:", db.reviews.countDocuments(), "users:", db.users.countDocuments())'
        ],
        capture_output=True,
        text=True,
        timeout=10
    )
    output = result.stdout.strip()
    print(f"   MongoDB counts: {output}")
    
    # Parse output
    vendor_count = 0
    review_count = 0
    if 'vendors:' in output:
        parts = output.split()
        for i, part in enumerate(parts):
            if part == 'vendors:' and i + 1 < len(parts):
                vendor_count = int(parts[i + 1])
            if part == 'reviews:' and i + 1 < len(parts):
                review_count = int(parts[i + 1])
    
    passed = vendor_count >= 32 and review_count >= 4
    log_test(
        "G1: Data preservation - vendors ≥32, reviews ≥4",
        passed,
        f"Vendors: {vendor_count}, Reviews: {review_count}"
    )
except Exception as e:
    log_test("G1: Data preservation - vendors ≥32, reviews ≥4", False, f"Error: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
test_section("TEST SUMMARY")

print(f"\nTotal Tests: {results['passed'] + results['failed']}")
print(f"✅ Passed: {results['passed']}")
print(f"❌ Failed: {results['failed']}")
print(f"Pass Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%\n")

if results['failed'] > 0:
    print("Failed Tests:")
    for test in results['tests']:
        if not test['passed']:
            print(f"  ❌ {test['name']}")
            if test['details']:
                print(f"     {test['details']}")

print("\n" + "="*80)
print("  Bug Fix Verification Complete")
print("="*80 + "\n")
