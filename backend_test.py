#!/usr/bin/env python3
"""
Security Hardening Regression Test Suite for Vows & Venues
Tests: Seed Gate, Auth Hardening (bcrypt + JWT), CORS Allowlist, Role-based Middleware
"""

import requests
import json
import jwt
import time
from datetime import datetime, timedelta

BASE_URL = "https://occasion-hub-39.preview.emergentagent.com/api"

# Test results tracking
test_results = {
    "seed_gate": {"passed": 0, "failed": 0, "details": []},
    "auth_hardening": {"passed": 0, "failed": 0, "details": []},
    "cors_allowlist": {"passed": 0, "failed": 0, "details": []},
    "role_middleware": {"passed": 0, "failed": 0, "details": []},
    "jwt_integrity": {"passed": 0, "failed": 0, "details": []},
    "identity_pinning": {"passed": 0, "failed": 0, "details": []},
    "legacy_public": {"passed": 0, "failed": 0, "details": []},
}

def log_test(category, test_name, passed, details=""):
    """Log test result"""
    if passed:
        test_results[category]["passed"] += 1
        print(f"✅ {test_name}")
    else:
        test_results[category]["failed"] += 1
        print(f"❌ {test_name}: {details}")
    test_results[category]["details"].append({
        "test": test_name,
        "passed": passed,
        "details": details
    })

def test_seed_gate_static_verification():
    """A) Seed Route Gate - Static code verification"""
    print("\n=== A) SEED ROUTE GATE (Static Verification) ===")
    
    # Read the route.js file and verify the guard is present
    try:
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            content = f.read()
        
        # Check for production guard
        has_production_check = "if (IS_PRODUCTION)" in content or "process.env.NODE_ENV === 'production'" in content
        has_seed_key_check = "process.env.SEED_KEY" in content and "x-seed-key" in content
        has_403_response = "'Seed endpoint is disabled in production'" in content and "status: 403" in content
        has_delete_before_guard = content.find("if (IS_PRODUCTION)") < content.find("deleteMany({})")
        
        if has_production_check and has_seed_key_check and has_403_response and has_delete_before_guard:
            log_test("seed_gate", "Seed route has production guard BEFORE deleteMany", True)
            log_test("seed_gate", "Guard checks SEED_KEY header/query", True)
            log_test("seed_gate", "Guard returns 403 when invalid", True)
        else:
            log_test("seed_gate", "Seed route guard verification", False, 
                    f"prod_check={has_production_check}, key_check={has_seed_key_check}, 403={has_403_response}, order={has_delete_before_guard}")
    except Exception as e:
        log_test("seed_gate", "Static code verification", False, str(e))

def test_auth_hardening():
    """B) Auth Hardening - bcrypt + JWT HS256 + 7d expiry"""
    print("\n=== B) AUTH HARDENING (bcrypt + JWT) ===")
    
    # Generate unique test emails
    timestamp = int(time.time())
    test_email = f"security_test_{timestamp}@vowsandvenues.test"
    test_password = "SecurePass123"
    
    # Test 1: Signup with valid data
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "name": "Security Test User",
            "email": test_email,
            "password": test_password,
            "role": "customer"
        })
        
        if resp.status_code == 201:
            data = resp.json()
            if "user" in data and "token" in data:
                user = data["user"]
                token = data["token"]
                
                # Verify no password in response
                if "password" not in user and "passwordHash" not in user:
                    log_test("auth_hardening", "Signup returns 201 with user+token, no password exposed", True)
                else:
                    log_test("auth_hardening", "Signup password exposure", False, "password/passwordHash in response")
                
                # Decode JWT and verify structure
                try:
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    
                    # Check algorithm
                    header = jwt.get_unverified_header(token)
                    if header.get("alg") == "HS256":
                        log_test("auth_hardening", "JWT uses HS256 algorithm", True)
                    else:
                        log_test("auth_hardening", "JWT algorithm", False, f"Expected HS256, got {header.get('alg')}")
                    
                    # Check payload structure
                    if decoded.get("sub") == user["id"] and decoded.get("role") == "customer" and decoded.get("email") == test_email:
                        log_test("auth_hardening", "JWT payload contains sub=user.id, role, email", True)
                    else:
                        log_test("auth_hardening", "JWT payload structure", False, f"Payload: {decoded}")
                    
                    # Check expiry (~7 days)
                    if "exp" in decoded:
                        exp_time = datetime.fromtimestamp(decoded["exp"])
                        now = datetime.now()
                        days_diff = (exp_time - now).days
                        if 6 <= days_diff <= 8:  # Allow some tolerance
                            log_test("auth_hardening", "JWT expiry ≈ 7 days", True)
                        else:
                            log_test("auth_hardening", "JWT expiry", False, f"Expected ~7 days, got {days_diff} days")
                    else:
                        log_test("auth_hardening", "JWT expiry", False, "No exp claim in token")
                        
                except Exception as e:
                    log_test("auth_hardening", "JWT decode", False, str(e))
            else:
                log_test("auth_hardening", "Signup response structure", False, f"Missing user or token: {data}")
        else:
            log_test("auth_hardening", "Signup with valid data", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("auth_hardening", "Signup request", False, str(e))
    
    # Test 2: Duplicate signup returns 409
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "name": "Duplicate User",
            "email": test_email,
            "password": "AnotherPass123",
            "role": "customer"
        })
        
        if resp.status_code == 409:
            log_test("auth_hardening", "Duplicate email returns 409", True)
        else:
            log_test("auth_hardening", "Duplicate email handling", False, f"Expected 409, got {resp.status_code}")
    except Exception as e:
        log_test("auth_hardening", "Duplicate signup test", False, str(e))
    
    # Test 3: Password too short returns 400
    try:
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "name": "Short Pass User",
            "email": f"short_{timestamp}@test.com",
            "password": "12345",  # Only 5 chars
            "role": "customer"
        })
        
        if resp.status_code == 400:
            log_test("auth_hardening", "Password < 6 chars returns 400", True)
        else:
            log_test("auth_hardening", "Short password validation", False, f"Expected 400, got {resp.status_code}")
    except Exception as e:
        log_test("auth_hardening", "Short password test", False, str(e))
    
    # Test 4: Login with correct credentials
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        
        if resp.status_code == 200:
            data = resp.json()
            if "user" in data and "token" in data:
                log_test("auth_hardening", "Login with correct credentials returns 200 + JWT", True)
                # Save token for later tests
                global customer_token, customer_user_id
                customer_token = data["token"]
                customer_user_id = data["user"]["id"]
            else:
                log_test("auth_hardening", "Login response structure", False, f"Missing user or token: {data}")
        else:
            log_test("auth_hardening", "Login with correct credentials", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("auth_hardening", "Login request", False, str(e))
    
    # Test 5: Login with wrong password returns 401
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_email,
            "password": "WrongPassword123"
        })
        
        if resp.status_code == 401:
            log_test("auth_hardening", "Wrong password returns 401", True)
        else:
            log_test("auth_hardening", "Wrong password handling", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("auth_hardening", "Wrong password test", False, str(e))
    
    # Test 6: Login with missing email returns 400
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "password": test_password
        })
        
        if resp.status_code == 400:
            log_test("auth_hardening", "Missing email returns 400", True)
        else:
            log_test("auth_hardening", "Missing email validation", False, f"Expected 400, got {resp.status_code}")
    except Exception as e:
        log_test("auth_hardening", "Missing email test", False, str(e))
    
    # Test 7: Verify password is bcrypt-hashed in DB
    try:
        import subprocess
        result = subprocess.run([
            "mongosh", "--quiet", "--eval",
            f'db=db.getSiblingDB("your_database_name"); const u=db.users.findOne({{email:"{test_email}"}}); print("hasHash:", !!u.passwordHash, "hashStart:", (u.passwordHash||"").slice(0,7))'
        ], capture_output=True, text=True, timeout=10)
        
        output = result.stdout.strip()
        if "hasHash: true" in output and ("$2a$10$" in output or "$2b$10$" in output):
            log_test("auth_hardening", "Password stored as bcrypt hash (verified in DB)", True)
        else:
            log_test("auth_hardening", "Bcrypt hash verification", False, f"Output: {output}")
    except Exception as e:
        log_test("auth_hardening", "DB hash verification", False, str(e))
    
    # Test 8: Google OAuth mock
    try:
        google_email = f"google_test_{timestamp}@vowsandvenues.test"
        resp = requests.post(f"{BASE_URL}/auth/google", json={
            "name": "Google Test User",
            "email": google_email
        })
        
        if resp.status_code == 200:
            data = resp.json()
            if "user" in data and "token" in data:
                log_test("auth_hardening", "Google OAuth mock returns 200 + valid JWT", True)
            else:
                log_test("auth_hardening", "Google OAuth response", False, f"Missing user or token: {data}")
        else:
            log_test("auth_hardening", "Google OAuth mock", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("auth_hardening", "Google OAuth test", False, str(e))
    
    # Test 9: GET /auth/me with valid Bearer token
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {customer_token}"
        })
        
        if resp.status_code == 200:
            data = resp.json()
            if "user" in data and data["user"]["id"] == customer_user_id:
                log_test("auth_hardening", "GET /auth/me with valid Bearer returns 200", True)
            else:
                log_test("auth_hardening", "GET /auth/me response", False, f"Unexpected data: {data}")
        else:
            log_test("auth_hardening", "GET /auth/me with valid token", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("auth_hardening", "GET /auth/me test", False, str(e))
    
    # Test 10: GET /auth/me without header returns 401
    try:
        resp = requests.get(f"{BASE_URL}/auth/me")
        
        if resp.status_code == 401:
            log_test("auth_hardening", "GET /auth/me without header returns 401", True)
        else:
            log_test("auth_hardening", "GET /auth/me no auth", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("auth_hardening", "GET /auth/me no auth test", False, str(e))
    
    # Test 11: GET /auth/me with tampered token returns 401
    try:
        tampered_token = customer_token[:-5] + "XXXXX"
        resp = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {tampered_token}"
        })
        
        if resp.status_code == 401:
            log_test("auth_hardening", "GET /auth/me with tampered token returns 401", True)
        else:
            log_test("auth_hardening", "Tampered token handling", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("auth_hardening", "Tampered token test", False, str(e))

def test_cors_allowlist():
    """F) CORS Allowlist"""
    print("\n=== F) CORS ALLOWLIST ===")
    
    # Test 1: Allowed origin (https://vowsandvenues.in)
    try:
        resp = requests.options(f"{BASE_URL}/root", headers={
            "Origin": "https://vowsandvenues.in"
        })
        
        acao = resp.headers.get("Access-Control-Allow-Origin")
        vary = resp.headers.get("Vary")
        
        if resp.status_code == 200 and acao == "https://vowsandvenues.in" and "Origin" in (vary or ""):
            log_test("cors_allowlist", "OPTIONS with Origin: https://vowsandvenues.in → ACAO reflected + Vary: Origin", True)
        else:
            log_test("cors_allowlist", "Allowed origin reflection", False, 
                    f"Status {resp.status_code}, ACAO={acao}, Vary={vary}")
    except Exception as e:
        log_test("cors_allowlist", "Allowed origin test 1", False, str(e))
    
    # Test 2: Allowed origin (https://www.vowsandvenues.in)
    try:
        resp = requests.options(f"{BASE_URL}/root", headers={
            "Origin": "https://www.vowsandvenues.in"
        })
        
        acao = resp.headers.get("Access-Control-Allow-Origin")
        
        if resp.status_code == 200 and acao == "https://www.vowsandvenues.in":
            log_test("cors_allowlist", "OPTIONS with Origin: https://www.vowsandvenues.in → ACAO reflected", True)
        else:
            log_test("cors_allowlist", "Allowed origin reflection (www)", False, 
                    f"Status {resp.status_code}, ACAO={acao}")
    except Exception as e:
        log_test("cors_allowlist", "Allowed origin test 2", False, str(e))
    
    # Test 3: Disallowed origin (https://evil.example.com)
    try:
        resp = requests.options(f"{BASE_URL}/root", headers={
            "Origin": "https://evil.example.com"
        })
        
        acao = resp.headers.get("Access-Control-Allow-Origin")
        
        if resp.status_code == 200 and not acao:
            log_test("cors_allowlist", "OPTIONS with Origin: https://evil.example.com → NO ACAO header", True)
        else:
            log_test("cors_allowlist", "Disallowed origin handling", False, 
                    f"Status {resp.status_code}, ACAO={acao} (should be None)")
    except Exception as e:
        log_test("cors_allowlist", "Disallowed origin test", False, str(e))
    
    # Test 4: No Origin header
    try:
        resp = requests.options(f"{BASE_URL}/root")
        
        acao = resp.headers.get("Access-Control-Allow-Origin")
        
        if resp.status_code == 200 and not acao:
            log_test("cors_allowlist", "OPTIONS with no Origin → NO ACAO header", True)
        else:
            log_test("cors_allowlist", "No origin handling", False, 
                    f"Status {resp.status_code}, ACAO={acao} (should be None)")
    except Exception as e:
        log_test("cors_allowlist", "No origin test", False, str(e))
    
    # Test 5: GET request with allowed origin
    try:
        resp = requests.get(f"{BASE_URL}/vendors", headers={
            "Origin": "https://vowsandvenues.in"
        })
        
        acao = resp.headers.get("Access-Control-Allow-Origin")
        
        if resp.status_code == 200 and acao == "https://vowsandvenues.in":
            log_test("cors_allowlist", "GET /vendors with allowed Origin → ACAO reflected", True)
        else:
            log_test("cors_allowlist", "GET with allowed origin", False, 
                    f"Status {resp.status_code}, ACAO={acao}")
    except Exception as e:
        log_test("cors_allowlist", "GET allowed origin test", False, str(e))
    
    # Test 6: GET request with disallowed origin (still returns data, but no ACAO)
    try:
        resp = requests.get(f"{BASE_URL}/vendors", headers={
            "Origin": "https://evil.example.com"
        })
        
        acao = resp.headers.get("Access-Control-Allow-Origin")
        
        if resp.status_code == 200 and not acao:
            log_test("cors_allowlist", "GET /vendors with disallowed Origin → 200 but NO ACAO", True)
        else:
            log_test("cors_allowlist", "GET with disallowed origin", False, 
                    f"Status {resp.status_code}, ACAO={acao} (should be None)")
    except Exception as e:
        log_test("cors_allowlist", "GET disallowed origin test", False, str(e))

def test_role_based_middleware():
    """C) Role-based Auth Middleware"""
    print("\n=== C) ROLE-BASED AUTH MIDDLEWARE ===")
    
    # Create test users: customer, vendor, admin
    timestamp = int(time.time())
    
    # Customer user (already created in auth_hardening tests)
    global customer_token, customer_user_id
    
    # Vendor user
    try:
        vendor_email = f"vendor_test_{timestamp}@vowsandvenues.test"
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "name": "Vendor Test User",
            "email": vendor_email,
            "password": "VendorPass123",
            "role": "vendor"
        })
        
        if resp.status_code == 201:
            data = resp.json()
            vendor_token = data["token"]
            vendor_user_id = data["user"]["id"]
            print(f"✓ Created vendor user: {vendor_user_id}")
        else:
            print(f"✗ Failed to create vendor user: {resp.status_code}")
            vendor_token = None
            vendor_user_id = None
    except Exception as e:
        print(f"✗ Vendor user creation error: {e}")
        vendor_token = None
        vendor_user_id = None
    
    # Admin user (signup as customer, then bump role in DB)
    try:
        admin_email = f"admin_test_{timestamp}@vowsandvenues.test"
        resp = requests.post(f"{BASE_URL}/auth/signup", json={
            "name": "Admin Test User",
            "email": admin_email,
            "password": "AdminPass123",
            "role": "customer"
        })
        
        if resp.status_code == 201:
            # Bump role to admin in DB
            import subprocess
            result = subprocess.run([
                "mongosh", "--quiet", "--eval",
                f'db=db.getSiblingDB("your_database_name"); db.users.updateOne({{email:"{admin_email}"}}, {{$set:{{role:"admin"}}}}); print("Updated")'
            ], capture_output=True, text=True, timeout=10)
            
            # Login again to get fresh JWT with admin role
            resp = requests.post(f"{BASE_URL}/auth/login", json={
                "email": admin_email,
                "password": "AdminPass123"
            })
            
            if resp.status_code == 200:
                data = resp.json()
                admin_token = data["token"]
                admin_user_id = data["user"]["id"]
                print(f"✓ Created admin user: {admin_user_id}")
            else:
                print(f"✗ Failed to login as admin: {resp.status_code}")
                admin_token = None
                admin_user_id = None
        else:
            print(f"✗ Failed to create admin user: {resp.status_code}")
            admin_token = None
            admin_user_id = None
    except Exception as e:
        print(f"✗ Admin user creation error: {e}")
        admin_token = None
        admin_user_id = None
    
    # Test matrix for admin endpoints
    admin_endpoints = [
        ("GET", "/admin/stats", {}),
        ("GET", "/admin/vendors", {}),
    ]
    
    for method, endpoint, body in admin_endpoints:
        # Test with customer (should be 403)
        try:
            if method == "GET":
                resp = requests.get(f"{BASE_URL}{endpoint}", headers={"Authorization": f"Bearer {customer_token}"})
            else:
                resp = requests.request(method, f"{BASE_URL}{endpoint}", json=body, headers={"Authorization": f"Bearer {customer_token}"})
            
            if resp.status_code == 403:
                log_test("role_middleware", f"{method} {endpoint} → customer: 403", True)
            else:
                log_test("role_middleware", f"{method} {endpoint} customer access", False, f"Expected 403, got {resp.status_code}")
        except Exception as e:
            log_test("role_middleware", f"{method} {endpoint} customer test", False, str(e))
        
        # Test with vendor (should be 403)
        if vendor_token:
            try:
                if method == "GET":
                    resp = requests.get(f"{BASE_URL}{endpoint}", headers={"Authorization": f"Bearer {vendor_token}"})
                else:
                    resp = requests.request(method, f"{BASE_URL}{endpoint}", json=body, headers={"Authorization": f"Bearer {vendor_token}"})
                
                if resp.status_code == 403:
                    log_test("role_middleware", f"{method} {endpoint} → vendor: 403", True)
                else:
                    log_test("role_middleware", f"{method} {endpoint} vendor access", False, f"Expected 403, got {resp.status_code}")
            except Exception as e:
                log_test("role_middleware", f"{method} {endpoint} vendor test", False, str(e))
        
        # Test with admin (should be 200)
        if admin_token:
            try:
                if method == "GET":
                    resp = requests.get(f"{BASE_URL}{endpoint}", headers={"Authorization": f"Bearer {admin_token}"})
                else:
                    resp = requests.request(method, f"{BASE_URL}{endpoint}", json=body, headers={"Authorization": f"Bearer {admin_token}"})
                
                if resp.status_code == 200:
                    log_test("role_middleware", f"{method} {endpoint} → admin: 200", True)
                else:
                    log_test("role_middleware", f"{method} {endpoint} admin access", False, f"Expected 200, got {resp.status_code}")
            except Exception as e:
                log_test("role_middleware", f"{method} {endpoint} admin test", False, str(e))
        
        # Test with no auth (should be 401)
        try:
            if method == "GET":
                resp = requests.get(f"{BASE_URL}{endpoint}")
            else:
                resp = requests.request(method, f"{BASE_URL}{endpoint}", json=body)
            
            if resp.status_code == 401:
                log_test("role_middleware", f"{method} {endpoint} → no-auth: 401", True)
            else:
                log_test("role_middleware", f"{method} {endpoint} no auth", False, f"Expected 401, got {resp.status_code}")
        except Exception as e:
            log_test("role_middleware", f"{method} {endpoint} no auth test", False, str(e))
    
    # Test vendor-specific endpoints
    # GET /vendors/mine
    try:
        resp = requests.get(f"{BASE_URL}/vendors/mine", headers={"Authorization": f"Bearer {customer_token}"})
        if resp.status_code == 403:
            log_test("role_middleware", "GET /vendors/mine → customer: 403", True)
        else:
            log_test("role_middleware", "GET /vendors/mine customer access", False, f"Expected 403, got {resp.status_code}")
    except Exception as e:
        log_test("role_middleware", "GET /vendors/mine customer test", False, str(e))
    
    if vendor_token:
        try:
            resp = requests.get(f"{BASE_URL}/vendors/mine", headers={"Authorization": f"Bearer {vendor_token}"})
            if resp.status_code == 200:
                log_test("role_middleware", "GET /vendors/mine → vendor: 200", True)
            else:
                log_test("role_middleware", "GET /vendors/mine vendor access", False, f"Expected 200, got {resp.status_code}")
        except Exception as e:
            log_test("role_middleware", "GET /vendors/mine vendor test", False, str(e))
    
    if admin_token:
        try:
            resp = requests.get(f"{BASE_URL}/vendors/mine", headers={"Authorization": f"Bearer {admin_token}"})
            if resp.status_code == 200:
                log_test("role_middleware", "GET /vendors/mine → admin: 200", True)
            else:
                log_test("role_middleware", "GET /vendors/mine admin access", False, f"Expected 200, got {resp.status_code}")
        except Exception as e:
            log_test("role_middleware", "GET /vendors/mine admin test", False, str(e))
    
    try:
        resp = requests.get(f"{BASE_URL}/vendors/mine")
        if resp.status_code == 401:
            log_test("role_middleware", "GET /vendors/mine → no-auth: 401", True)
        else:
            log_test("role_middleware", "GET /vendors/mine no auth", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("role_middleware", "GET /vendors/mine no auth test", False, str(e))
    
    # GET /vendor/stats
    try:
        resp = requests.get(f"{BASE_URL}/vendor/stats", headers={"Authorization": f"Bearer {customer_token}"})
        if resp.status_code == 403:
            log_test("role_middleware", "GET /vendor/stats → customer: 403", True)
        else:
            log_test("role_middleware", "GET /vendor/stats customer access", False, f"Expected 403, got {resp.status_code}")
    except Exception as e:
        log_test("role_middleware", "GET /vendor/stats customer test", False, str(e))
    
    if vendor_token:
        try:
            resp = requests.get(f"{BASE_URL}/vendor/stats", headers={"Authorization": f"Bearer {vendor_token}"})
            if resp.status_code in [200, 404]:  # 404 if no vendor profile yet
                log_test("role_middleware", "GET /vendor/stats → vendor: 200 or 404", True)
            else:
                log_test("role_middleware", "GET /vendor/stats vendor access", False, f"Expected 200/404, got {resp.status_code}")
        except Exception as e:
            log_test("role_middleware", "GET /vendor/stats vendor test", False, str(e))
    
    # Test POST /vendors (onboarding) - vendor or admin only
    try:
        resp = requests.post(f"{BASE_URL}/vendors", json={
            "name": "Test Vendor",
            "category": "venues",
            "city": "Test City"
        }, headers={"Authorization": f"Bearer {customer_token}"})
        
        if resp.status_code == 403:
            log_test("role_middleware", "POST /vendors → customer: 403", True)
        else:
            log_test("role_middleware", "POST /vendors customer access", False, f"Expected 403, got {resp.status_code}")
    except Exception as e:
        log_test("role_middleware", "POST /vendors customer test", False, str(e))
    
    if vendor_token:
        try:
            resp = requests.post(f"{BASE_URL}/vendors", json={
                "name": "Vendor Test Venue",
                "category": "venues",
                "city": "Lucknow",
                "address": "Test Address",
                "contactPhone": "+91 98765 43210",
                "email": "vendor@test.com"
            }, headers={"Authorization": f"Bearer {vendor_token}"})
            
            if resp.status_code == 201:
                log_test("role_middleware", "POST /vendors → vendor: 201", True)
                # Save vendor ID for later tests
                global test_vendor_id
                test_vendor_id = resp.json().get("id")
            else:
                log_test("role_middleware", "POST /vendors vendor access", False, f"Expected 201, got {resp.status_code}: {resp.text}")
        except Exception as e:
            log_test("role_middleware", "POST /vendors vendor test", False, str(e))
    
    try:
        resp = requests.post(f"{BASE_URL}/vendors", json={
            "name": "Test Vendor",
            "category": "venues",
            "city": "Test City"
        })
        
        if resp.status_code == 401:
            log_test("role_middleware", "POST /vendors → no-auth: 401", True)
        else:
            log_test("role_middleware", "POST /vendors no auth", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("role_middleware", "POST /vendors no auth test", False, str(e))

def test_jwt_integrity():
    """D) JWT Integrity"""
    print("\n=== D) JWT INTEGRITY ===")
    
    # Test 1: Tampered token (already tested in auth_hardening, but repeat here)
    try:
        tampered_token = customer_token[:-5] + "XXXXX"
        resp = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {tampered_token}"
        })
        
        if resp.status_code == 401:
            log_test("jwt_integrity", "Tampered token → 401", True)
        else:
            log_test("jwt_integrity", "Tampered token handling", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("jwt_integrity", "Tampered token test", False, str(e))
    
    # Test 2: Expired token
    try:
        # Create an expired token (using the JWT_SECRET from .env)
        with open('/app/.env', 'r') as f:
            env_content = f.read()
            jwt_secret = None
            for line in env_content.split('\n'):
                if line.startswith('JWT_SECRET='):
                    jwt_secret = line.split('=', 1)[1].strip()
                    break
        
        if jwt_secret:
            expired_payload = {
                "sub": "test_user_id",
                "role": "customer",
                "email": "test@test.com",
                "exp": int(time.time()) - 3600  # Expired 1 hour ago
            }
            expired_token = jwt.encode(expired_payload, jwt_secret, algorithm="HS256")
            
            resp = requests.get(f"{BASE_URL}/auth/me", headers={
                "Authorization": f"Bearer {expired_token}"
            })
            
            if resp.status_code == 401:
                log_test("jwt_integrity", "Expired token → 401", True)
            else:
                log_test("jwt_integrity", "Expired token handling", False, f"Expected 401, got {resp.status_code}")
        else:
            log_test("jwt_integrity", "Expired token test", False, "Could not read JWT_SECRET from .env")
    except Exception as e:
        log_test("jwt_integrity", "Expired token test", False, str(e))
    
    # Test 3: Malformed token
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": "Bearer not.a.valid.jwt.token"
        })
        
        if resp.status_code == 401:
            log_test("jwt_integrity", "Malformed token → 401", True)
        else:
            log_test("jwt_integrity", "Malformed token handling", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("jwt_integrity", "Malformed token test", False, str(e))
    
    # Test 4: No Bearer prefix
    try:
        resp = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": customer_token  # Missing "Bearer " prefix
        })
        
        if resp.status_code == 401:
            log_test("jwt_integrity", "No Bearer prefix → 401", True)
        else:
            log_test("jwt_integrity", "No Bearer prefix handling", False, f"Expected 401, got {resp.status_code}")
    except Exception as e:
        log_test("jwt_integrity", "No Bearer prefix test", False, str(e))

def test_identity_pinning():
    """E) Identity Pinning (server ignores client userId)"""
    print("\n=== E) IDENTITY PINNING ===")
    
    # Test POST /events with attacker userId
    try:
        resp = requests.post(f"{BASE_URL}/events", json={
            "userId": "attacker-userid-xxx",  # Client tries to set different userId
            "name": "Security Test Event",
            "eventType": "Wedding",
            "date": "2026-12-31",
            "guestCount": 100,
            "budget": 500000
        }, headers={"Authorization": f"Bearer {customer_token}"})
        
        if resp.status_code == 201:
            data = resp.json()
            event_id = data.get("id")
            
            # Verify the stored userId matches JWT sub, not client value
            if data.get("userId") == customer_user_id:
                log_test("identity_pinning", "POST /events → userId pinned to JWT sub", True)
            else:
                log_test("identity_pinning", "POST /events identity pinning", False, 
                        f"Expected userId={customer_user_id}, got {data.get('userId')}")
        else:
            log_test("identity_pinning", "POST /events", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("identity_pinning", "POST /events test", False, str(e))
    
    # Test POST /bookings with attacker userId
    try:
        # First get a vendor to book
        resp = requests.get(f"{BASE_URL}/vendors?category=venues")
        vendors = resp.json()
        if vendors and len(vendors) > 0:
            vendor_id = vendors[0]["id"]
            
            resp = requests.post(f"{BASE_URL}/bookings", json={
                "userId": "attacker-userid-xxx",
                "vendorId": vendor_id,
                "eventDate": "2026-12-31",
                "guestCount": 100,
                "totalAmount": 100000
            }, headers={"Authorization": f"Bearer {customer_token}"})
            
            if resp.status_code == 201:
                data = resp.json()
                if data.get("userId") == customer_user_id:
                    log_test("identity_pinning", "POST /bookings → userId pinned to JWT sub", True)
                else:
                    log_test("identity_pinning", "POST /bookings identity pinning", False, 
                            f"Expected userId={customer_user_id}, got {data.get('userId')}")
            else:
                log_test("identity_pinning", "POST /bookings", False, f"Status {resp.status_code}: {resp.text}")
        else:
            log_test("identity_pinning", "POST /bookings test", False, "No vendors available")
    except Exception as e:
        log_test("identity_pinning", "POST /bookings test", False, str(e))
    
    # Test POST /reviews with attacker userId
    try:
        resp = requests.get(f"{BASE_URL}/vendors?category=venues")
        vendors = resp.json()
        if vendors and len(vendors) > 0:
            vendor_id = vendors[0]["id"]
            
            resp = requests.post(f"{BASE_URL}/reviews", json={
                "userId": "attacker-userid-xxx",
                "vendorId": vendor_id,
                "rating": 5,
                "comment": "Security test review"
            }, headers={"Authorization": f"Bearer {customer_token}"})
            
            if resp.status_code == 201:
                data = resp.json()
                if data.get("userId") == customer_user_id:
                    log_test("identity_pinning", "POST /reviews → userId pinned to JWT sub", True)
                else:
                    log_test("identity_pinning", "POST /reviews identity pinning", False, 
                            f"Expected userId={customer_user_id}, got {data.get('userId')}")
            else:
                log_test("identity_pinning", "POST /reviews", False, f"Status {resp.status_code}: {resp.text}")
        else:
            log_test("identity_pinning", "POST /reviews test", False, "No vendors available")
    except Exception as e:
        log_test("identity_pinning", "POST /reviews test", False, str(e))
    
    # Test POST /inquiries with attacker userId
    try:
        resp = requests.get(f"{BASE_URL}/vendors?category=venues")
        vendors = resp.json()
        if vendors and len(vendors) > 0:
            vendor_id = vendors[0]["id"]
            
            resp = requests.post(f"{BASE_URL}/inquiries", json={
                "userId": "attacker-userid-xxx",
                "vendorId": vendor_id,
                "message": "Security test inquiry"
            }, headers={"Authorization": f"Bearer {customer_token}"})
            
            if resp.status_code == 201:
                data = resp.json()
                if data.get("userId") == customer_user_id:
                    log_test("identity_pinning", "POST /inquiries → userId pinned to JWT sub", True)
                else:
                    log_test("identity_pinning", "POST /inquiries identity pinning", False, 
                            f"Expected userId={customer_user_id}, got {data.get('userId')}")
            else:
                log_test("identity_pinning", "POST /inquiries", False, f"Status {resp.status_code}: {resp.text}")
        else:
            log_test("identity_pinning", "POST /inquiries test", False, "No vendors available")
    except Exception as e:
        log_test("identity_pinning", "POST /inquiries test", False, str(e))

def test_legacy_public_endpoints():
    """H) Legacy Public Endpoints"""
    print("\n=== H) LEGACY PUBLIC ENDPOINTS (no auth required) ===")
    
    public_endpoints = [
        "/root",
        "/categories",
        "/vendors",
        "/packages",
        "/reviews"
    ]
    
    for endpoint in public_endpoints:
        try:
            resp = requests.get(f"{BASE_URL}{endpoint}")
            
            if resp.status_code == 200:
                log_test("legacy_public", f"GET {endpoint} → 200 (no auth)", True)
            else:
                log_test("legacy_public", f"GET {endpoint}", False, f"Expected 200, got {resp.status_code}")
        except Exception as e:
            log_test("legacy_public", f"GET {endpoint} test", False, str(e))
    
    # Test GET /vendors/:id
    try:
        resp = requests.get(f"{BASE_URL}/vendors")
        vendors = resp.json()
        if vendors and len(vendors) > 0:
            vendor_id = vendors[0]["id"]
            resp = requests.get(f"{BASE_URL}/vendors/{vendor_id}")
            
            if resp.status_code == 200:
                log_test("legacy_public", f"GET /vendors/:id → 200 (no auth)", True)
            else:
                log_test("legacy_public", f"GET /vendors/:id", False, f"Expected 200, got {resp.status_code}")
        else:
            log_test("legacy_public", "GET /vendors/:id test", False, "No vendors available")
    except Exception as e:
        log_test("legacy_public", "GET /vendors/:id test", False, str(e))

def verify_data_preservation():
    """G) Data Preservation"""
    print("\n=== G) DATA PRESERVATION ===")
    
    try:
        import subprocess
        result = subprocess.run([
            "mongosh", "--quiet", "--eval",
            'db=db.getSiblingDB("your_database_name"); print("users:", db.users.countDocuments()); print("vendors:", db.vendors.countDocuments()); print("bookings:", db.bookings.countDocuments()); print("events:", db.events.countDocuments()); print("reviews:", db.reviews.countDocuments())'
        ], capture_output=True, text=True, timeout=10)
        
        output = result.stdout.strip()
        print(f"\nDatabase counts:\n{output}\n")
        
        # Parse counts
        counts = {}
        for line in output.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                counts[key.strip()] = int(value.strip())
        
        # Verify vendors >= 32, reviews >= 4
        if counts.get("vendors", 0) >= 32:
            log_test("legacy_public", "Data preservation: vendors ≥ 32", True)
        else:
            log_test("legacy_public", "Data preservation: vendors", False, f"Expected ≥32, got {counts.get('vendors', 0)}")
        
        if counts.get("reviews", 0) >= 4:
            log_test("legacy_public", "Data preservation: reviews ≥ 4", True)
        else:
            log_test("legacy_public", "Data preservation: reviews", False, f"Expected ≥4, got {counts.get('reviews', 0)}")
        
    except Exception as e:
        log_test("legacy_public", "Data preservation check", False, str(e))

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("SECURITY HARDENING TEST SUMMARY")
    print("="*80)
    
    total_passed = 0
    total_failed = 0
    
    for category, results in test_results.items():
        passed = results["passed"]
        failed = results["failed"]
        total = passed + failed
        total_passed += passed
        total_failed += failed
        
        status = "✅ PASS" if failed == 0 else "❌ FAIL"
        print(f"\n{category.upper().replace('_', ' ')}: {status}")
        print(f"  Passed: {passed}/{total}")
        if failed > 0:
            print(f"  Failed: {failed}/{total}")
            print("  Failed tests:")
            for detail in results["details"]:
                if not detail["passed"]:
                    print(f"    - {detail['test']}: {detail['details']}")
    
    print("\n" + "="*80)
    print(f"TOTAL: {total_passed} passed, {total_failed} failed out of {total_passed + total_failed} tests")
    print("="*80)
    
    return total_failed == 0

if __name__ == "__main__":
    print("Starting Security Hardening Regression Test Suite")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    # Initialize global variables
    customer_token = None
    customer_user_id = None
    test_vendor_id = None
    
    # Run all test suites
    test_seed_gate_static_verification()
    test_auth_hardening()
    test_cors_allowlist()
    test_role_based_middleware()
    test_jwt_integrity()
    test_identity_pinning()
    test_legacy_public_endpoints()
    verify_data_preservation()
    
    # Print summary
    all_passed = print_summary()
    
    exit(0 if all_passed else 1)
