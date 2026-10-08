#!/usr/bin/env python3
"""
Production Hardening Regression Test Suite for Vows & Venues
Tests: CORS edge fix, Real Google auth, Rate limiting, JWT hygiene, Full regression
Base URL: https://occasion-hub-39.preview.emergentagent.com/api
"""

import requests
import time
import subprocess
import json
from typing import Dict, Any

BASE_URL = "https://occasion-hub-39.preview.emergentagent.com/api"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.details = []
    
    def add_pass(self, test_name: str, detail: str = ""):
        self.passed += 1
        msg = f"✅ PASS: {test_name}"
        if detail:
            msg += f" - {detail}"
        print(msg)
        self.details.append({"test": test_name, "status": "PASS", "detail": detail})
    
    def add_fail(self, test_name: str, detail: str = ""):
        self.failed += 1
        msg = f"❌ FAIL: {test_name}"
        if detail:
            msg += f" - {detail}"
        print(msg)
        self.details.append({"test": test_name, "status": "FAIL", "detail": detail})
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*80}")
        print(f"TEST SUMMARY: {self.passed}/{total} passed ({self.failed} failed)")
        print(f"{'='*80}\n")
        return self.passed, self.failed

def test_cors_edge_fix(results: TestResults):
    """
    Test A) CORS edge — no more `*` wildcard
    - OPTIONS with evil origin → ACAO must be fallback (https://vowsandvenues.in), NO credentials
    - OPTIONS with allowed origin → ACAO reflected, credentials true
    - OPTIONS with www allowed origin → ACAO reflected, credentials true
    - OPTIONS with no Origin → ACAO fallback, no credentials
    - GET with evil origin → same expectations
    - Vary: Origin must be present
    """
    print("\n" + "="*80)
    print("TEST A) CORS EDGE FIX - No wildcard, always emit ACAO")
    print("="*80)
    
    test_url = f"{BASE_URL}/root"
    
    # Test 1: OPTIONS with evil origin
    print("\n[A1] OPTIONS with Origin: https://evil.example.com")
    try:
        resp = requests.options(test_url, headers={"Origin": "https://evil.example.com"}, timeout=10)
        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "")
        vary = resp.headers.get("Vary", "")
        
        print(f"  Status: {resp.status_code}")
        print(f"  ACAO: {acao}")
        print(f"  ACAC: {acac}")
        print(f"  Vary: {vary}")
        
        if acao == "*":
            results.add_fail("A1: Evil origin ACAO", f"Got wildcard '*', expected fallback")
        elif acao == "https://vowsandvenues.in":
            if acac.lower() == "true":
                results.add_fail("A1: Evil origin credentials", f"ACAC should NOT be true for disallowed origin")
            else:
                results.add_pass("A1: Evil origin ACAO", f"Fallback {acao}, no credentials")
        else:
            results.add_fail("A1: Evil origin ACAO", f"Expected https://vowsandvenues.in, got {acao}")
        
        if "Origin" not in vary:
            results.add_fail("A1: Vary header", f"Vary: Origin missing, got {vary}")
        else:
            results.add_pass("A1: Vary header", "Vary: Origin present")
    except Exception as e:
        results.add_fail("A1: OPTIONS evil origin", f"Exception: {e}")
    
    # Test 2: OPTIONS with allowed origin (https://vowsandvenues.in)
    print("\n[A2] OPTIONS with Origin: https://vowsandvenues.in")
    try:
        resp = requests.options(test_url, headers={"Origin": "https://vowsandvenues.in"}, timeout=10)
        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "")
        vary = resp.headers.get("Vary", "")
        
        print(f"  Status: {resp.status_code}")
        print(f"  ACAO: {acao}")
        print(f"  ACAC: {acac}")
        print(f"  Vary: {vary}")
        
        if acao == "https://vowsandvenues.in" and acac.lower() == "true":
            results.add_pass("A2: Allowed origin reflected", f"ACAO={acao}, credentials=true")
        else:
            results.add_fail("A2: Allowed origin reflected", f"Expected ACAO=https://vowsandvenues.in + credentials=true, got ACAO={acao}, ACAC={acac}")
        
        if "Origin" not in vary:
            results.add_fail("A2: Vary header", f"Vary: Origin missing")
        else:
            results.add_pass("A2: Vary header", "Vary: Origin present")
    except Exception as e:
        results.add_fail("A2: OPTIONS allowed origin", f"Exception: {e}")
    
    # Test 3: OPTIONS with www allowed origin
    print("\n[A3] OPTIONS with Origin: https://www.vowsandvenues.in")
    try:
        resp = requests.options(test_url, headers={"Origin": "https://www.vowsandvenues.in"}, timeout=10)
        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "")
        
        print(f"  Status: {resp.status_code}")
        print(f"  ACAO: {acao}")
        print(f"  ACAC: {acac}")
        
        if acao == "https://www.vowsandvenues.in" and acac.lower() == "true":
            results.add_pass("A3: WWW origin reflected", f"ACAO={acao}, credentials=true")
        else:
            results.add_fail("A3: WWW origin reflected", f"Expected ACAO=https://www.vowsandvenues.in + credentials=true, got ACAO={acao}, ACAC={acac}")
    except Exception as e:
        results.add_fail("A3: OPTIONS www origin", f"Exception: {e}")
    
    # Test 4: OPTIONS with no Origin header
    print("\n[A4] OPTIONS with no Origin header")
    try:
        resp = requests.options(test_url, timeout=10)
        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "")
        
        print(f"  Status: {resp.status_code}")
        print(f"  ACAO: {acao}")
        print(f"  ACAC: {acac}")
        
        if acao == "https://vowsandvenues.in":
            if acac.lower() == "true":
                results.add_fail("A4: No origin credentials", f"ACAC should NOT be true when no origin")
            else:
                results.add_pass("A4: No origin fallback", f"ACAO={acao}, no credentials")
        else:
            results.add_fail("A4: No origin fallback", f"Expected https://vowsandvenues.in, got {acao}")
    except Exception as e:
        results.add_fail("A4: OPTIONS no origin", f"Exception: {e}")
    
    # Test 5: GET with evil origin
    print("\n[A5] GET with Origin: https://evil.example.com")
    try:
        resp = requests.get(test_url, headers={"Origin": "https://evil.example.com"}, timeout=10)
        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "")
        
        print(f"  Status: {resp.status_code}")
        print(f"  ACAO: {acao}")
        print(f"  ACAC: {acac}")
        
        if acao == "*":
            results.add_fail("A5: GET evil origin ACAO", f"Got wildcard '*', expected fallback")
        elif acao == "https://vowsandvenues.in":
            if acac.lower() == "true":
                results.add_fail("A5: GET evil origin credentials", f"ACAC should NOT be true")
            else:
                results.add_pass("A5: GET evil origin ACAO", f"Fallback {acao}, no credentials")
        else:
            results.add_fail("A5: GET evil origin ACAO", f"Expected https://vowsandvenues.in, got {acao}")
    except Exception as e:
        results.add_fail("A5: GET evil origin", f"Exception: {e}")

def test_real_google_auth(results: TestResults):
    """
    Test B) Real Google auth (no mock)
    - POST /auth/google with no body → 503 (GOOGLE_CLIENT_ID unset)
    - POST /auth/google with fake token → 503
    - POST /auth/google with old mock body {name, email} → 503 or 400, MUST NOT create user
    - Static verification: no "MOCKED Google" in code
    - Verify user count unchanged
    """
    print("\n" + "="*80)
    print("TEST B) REAL GOOGLE AUTH - No mock, requires real token")
    print("="*80)
    
    # Get initial user count
    try:
        resp = requests.get(f"{BASE_URL}/root", timeout=10)
        initial_data = resp.json()
        initial_user_count = initial_data.get("users", 0)
        print(f"\nInitial user count: {initial_user_count}")
    except Exception as e:
        print(f"Warning: Could not get initial user count: {e}")
        initial_user_count = None
    
    # Test 1: POST with no body
    print("\n[B1] POST /auth/google with no body")
    try:
        resp = requests.post(f"{BASE_URL}/auth/google", json={}, timeout=10)
        print(f"  Status: {resp.status_code}")
        print(f"  Body: {resp.text[:200]}")
        
        if resp.status_code == 503:
            body = resp.json()
            if "not configured" in body.get("error", "").lower():
                results.add_pass("B1: No body → 503", f"Correct 503 with 'not configured' message")
            else:
                results.add_fail("B1: No body → 503", f"Got 503 but wrong message: {body.get('error')}")
        elif resp.status_code == 400:
            # Also acceptable if it checks for credential first
            results.add_pass("B1: No body → 400", f"Acceptable 400 (missing credential)")
        else:
            results.add_fail("B1: No body status", f"Expected 503 or 400, got {resp.status_code}")
    except Exception as e:
        results.add_fail("B1: POST no body", f"Exception: {e}")
    
    # Test 2: POST with fake token
    print("\n[B2] POST /auth/google with fake token")
    try:
        resp = requests.post(f"{BASE_URL}/auth/google", json={"credential": "fake-jwt-token-12345"}, timeout=10)
        print(f"  Status: {resp.status_code}")
        print(f"  Body: {resp.text[:200]}")
        
        if resp.status_code == 503:
            results.add_pass("B2: Fake token → 503", f"Correct 503 (GOOGLE_CLIENT_ID unset)")
        elif resp.status_code == 401:
            results.add_pass("B2: Fake token → 401", f"Would be 401 if GOOGLE_CLIENT_ID were set")
        else:
            results.add_fail("B2: Fake token status", f"Expected 503 or 401, got {resp.status_code}")
    except Exception as e:
        results.add_fail("B2: POST fake token", f"Exception: {e}")
    
    # Test 3: POST with old mock body {name, email}
    print("\n[B3] POST /auth/google with old mock body {name, email}")
    try:
        resp = requests.post(f"{BASE_URL}/auth/google", json={"name": "Mock User", "email": "mock@test.com"}, timeout=10)
        print(f"  Status: {resp.status_code}")
        print(f"  Body: {resp.text[:200]}")
        
        if resp.status_code in [503, 400]:
            body = resp.json()
            if "token" in body:
                results.add_fail("B3: Mock body rejected", f"MUST NOT issue token for mock body, but got token")
            else:
                results.add_pass("B3: Mock body rejected", f"Correct {resp.status_code}, no token issued")
        elif resp.status_code == 200 or resp.status_code == 201:
            results.add_fail("B3: Mock body rejected", f"MUST NOT accept mock body, but got {resp.status_code}")
        else:
            results.add_pass("B3: Mock body rejected", f"Got {resp.status_code}, no token")
    except Exception as e:
        results.add_fail("B3: POST mock body", f"Exception: {e}")
    
    # Test 4: Static verification - no "MOCKED Google" in code
    print("\n[B4] Static verification: grep for 'MOCKED Google'")
    try:
        result = subprocess.run(
            ["grep", "-n", "MOCKED Google", "/app/app/api/[[...path]]/route.js"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Found matches
            results.add_fail("B4: No mock code", f"Found 'MOCKED Google' in code:\n{result.stdout}")
        else:
            # No matches (grep returns 1 when no matches)
            results.add_pass("B4: No mock code", "No 'MOCKED Google' found in route.js")
    except Exception as e:
        results.add_fail("B4: Static verification", f"Exception: {e}")
    
    # Test 5: Verify user count unchanged
    if initial_user_count is not None:
        print("\n[B5] Verify user count unchanged")
        try:
            resp = requests.get(f"{BASE_URL}/root", timeout=10)
            final_data = resp.json()
            final_user_count = final_data.get("users", 0)
            print(f"  Initial: {initial_user_count}, Final: {final_user_count}")
            
            if final_user_count == initial_user_count:
                results.add_pass("B5: User count unchanged", f"Count={final_user_count}")
            else:
                results.add_fail("B5: User count unchanged", f"Changed from {initial_user_count} to {final_user_count}")
        except Exception as e:
            results.add_fail("B5: User count check", f"Exception: {e}")

def test_rate_limiting(results: TestResults):
    """
    Test C) Per-IP rate limiting on /auth/*
    - POST /auth/login with wrong password 6 times → 6th should be 429
    - POST /auth/signup 11 times → 11th should be 429
    - Response body must contain retryAfter
    """
    print("\n" + "="*80)
    print("TEST C) RATE LIMITING - Per-IP limits on /auth/*")
    print("="*80)
    
    # Test 1: Login rate limit (5/min for sensitive routes)
    print("\n[C1] POST /auth/login 6 times with wrong password")
    try:
        hit_429 = False
        retry_after_found = False
        
        for i in range(1, 7):
            resp = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": f"ratelimit-test-{int(time.time())}@test.com", "password": "wrongpass"},
                timeout=10
            )
            print(f"  Attempt {i}: Status {resp.status_code}")
            
            if resp.status_code == 429:
                hit_429 = True
                retry_after = resp.headers.get("Retry-After", "")
                body = resp.json()
                retry_after_body = body.get("retryAfter", 0)
                print(f"    Retry-After header: {retry_after}")
                print(f"    retryAfter in body: {retry_after_body}")
                
                if retry_after and int(retry_after) > 0:
                    retry_after_found = True
                if retry_after_body > 0:
                    retry_after_found = True
            
            time.sleep(0.2)  # Small delay between requests
        
        if hit_429:
            results.add_pass("C1: Login rate limit", f"Got 429 within 6 attempts")
            if retry_after_found:
                results.add_pass("C1: Retry-After present", "Header or body contains retryAfter")
            else:
                results.add_fail("C1: Retry-After present", "429 returned but no Retry-After")
        else:
            results.add_fail("C1: Login rate limit", f"Expected 429 within 6 attempts, all returned 401")
    except Exception as e:
        results.add_fail("C1: Login rate limit", f"Exception: {e}")
    
    # Wait a bit before next test
    print("\n  Waiting 2 seconds before signup test...")
    time.sleep(2)
    
    # Test 2: Signup rate limit (10/min for other auth routes)
    print("\n[C2] POST /auth/signup 11 times with different emails")
    try:
        hit_429 = False
        retry_after_found = False
        timestamp = int(time.time())
        
        for i in range(1, 12):
            resp = requests.post(
                f"{BASE_URL}/auth/signup",
                json={
                    "name": f"RateTest{i}",
                    "email": f"ratelimit-signup-{timestamp}-{i}@test.com",
                    "password": "testpass123"
                },
                timeout=10
            )
            print(f"  Attempt {i}: Status {resp.status_code}")
            
            if resp.status_code == 429:
                hit_429 = True
                retry_after = resp.headers.get("Retry-After", "")
                body = resp.json()
                retry_after_body = body.get("retryAfter", 0)
                print(f"    Retry-After header: {retry_after}")
                print(f"    retryAfter in body: {retry_after_body}")
                
                if retry_after and int(retry_after) > 0:
                    retry_after_found = True
                if retry_after_body > 0:
                    retry_after_found = True
                break
            
            time.sleep(0.2)
        
        if hit_429:
            results.add_pass("C2: Signup rate limit", f"Got 429 (limit is 10/min)")
            if retry_after_found:
                results.add_pass("C2: Retry-After present", "Header or body contains retryAfter")
            else:
                results.add_fail("C2: Retry-After present", "429 returned but no Retry-After")
        else:
            results.add_fail("C2: Signup rate limit", f"Expected 429 at 11th attempt, all succeeded")
    except Exception as e:
        results.add_fail("C2: Signup rate limit", f"Exception: {e}")

def test_jwt_secret_hygiene(results: TestResults):
    """
    Test D) JWT_SECRET hygiene
    - grep for JWT_SECRET in code → only process.env references
    - .gitignore contains .env
    - .env.example exists with JWT_SECRET= (blank)
    """
    print("\n" + "="*80)
    print("TEST D) JWT_SECRET HYGIENE - No hardcoded secrets")
    print("="*80)
    
    # Test 1: grep for JWT_SECRET in code
    print("\n[D1] grep -RIn 'JWT_SECRET' in /app --include='*.js' --include='*.json' --include='*.jsx'")
    try:
        result = subprocess.run(
            ["grep", "-RIn", "JWT_SECRET", "/app", "--include=*.js", "--include=*.json", "--include=*.jsx"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        lines = result.stdout.strip().split("\n") if result.stdout else []
        print(f"  Found {len(lines)} matches")
        
        bad_matches = []
        for line in lines:
            if not line:
                continue
            # Check if it's a safe reference
            lower_line = line.lower()
            if "process.env.jwt_secret" in lower_line:
                continue  # Safe
            if "jwt_secret=" in lower_line and ".env" in line:
                continue  # .env or .env.example file
            if "jwt_secret:" in lower_line or '"jwt_secret"' in lower_line:
                # Could be a comment or variable declaration
                if "const jwt_secret = process.env" in lower_line:
                    continue  # Safe
                if "//" in line or "/*" in line or "*/" in line or "#" in line:
                    continue  # Comment
            
            # If we get here, might be suspicious
            if "jwt_secret" in lower_line and "=" in line and "process.env" not in lower_line:
                # Check if it's actually a hardcoded value
                if any(char in line for char in ['"', "'"]) and "process.env" not in line:
                    bad_matches.append(line)
        
        if bad_matches:
            results.add_fail("D1: No hardcoded JWT_SECRET", f"Found {len(bad_matches)} suspicious matches:\n" + "\n".join(bad_matches[:3]))
        else:
            results.add_pass("D1: No hardcoded JWT_SECRET", f"All {len(lines)} references are safe (process.env or .env files)")
    except Exception as e:
        results.add_fail("D1: grep JWT_SECRET", f"Exception: {e}")
    
    # Test 2: .gitignore contains .env
    print("\n[D2] Check .gitignore contains .env")
    try:
        with open("/app/.gitignore", "r") as f:
            gitignore = f.read()
        
        if ".env" in gitignore:
            results.add_pass("D2: .gitignore has .env", "Found .env in .gitignore")
        else:
            results.add_fail("D2: .gitignore has .env", ".env not found in .gitignore")
    except Exception as e:
        results.add_fail("D2: .gitignore check", f"Exception: {e}")
    
    # Test 3: .env.example exists with JWT_SECRET= (blank)
    print("\n[D3] Check .env.example exists with JWT_SECRET= (blank)")
    try:
        with open("/app/.env.example", "r") as f:
            env_example = f.read()
        
        if "JWT_SECRET=" in env_example:
            # Check if it's blank or has a placeholder
            for line in env_example.split("\n"):
                if line.startswith("JWT_SECRET="):
                    value = line.split("=", 1)[1].strip()
                    if not value or value == "" or value.startswith("#"):
                        results.add_pass("D3: .env.example JWT_SECRET", "JWT_SECRET= is blank (safe)")
                    else:
                        results.add_fail("D3: .env.example JWT_SECRET", f"JWT_SECRET has value: {value[:20]}...")
                    break
        else:
            results.add_fail("D3: .env.example JWT_SECRET", "JWT_SECRET= not found in .env.example")
    except Exception as e:
        results.add_fail("D3: .env.example check", f"Exception: {e}")

def test_seed_key_unset(results: TestResults):
    """
    Test E) SEED_KEY unset in production
    - Confirm SEED_KEY not in .env or is empty
    - Static verify seed guard in route.js
    """
    print("\n" + "="*80)
    print("TEST E) SEED_KEY UNSET - Production seed blocked")
    print("="*80)
    
    # Test 1: SEED_KEY not in .env
    print("\n[E1] Check SEED_KEY not in .env or is empty")
    try:
        with open("/app/.env", "r") as f:
            env_content = f.read()
        
        if "SEED_KEY=" in env_content:
            for line in env_content.split("\n"):
                if line.startswith("SEED_KEY="):
                    value = line.split("=", 1)[1].strip()
                    if not value:
                        results.add_pass("E1: SEED_KEY unset", "SEED_KEY= is blank")
                    else:
                        results.add_fail("E1: SEED_KEY unset", f"SEED_KEY has value (should be blank)")
                    break
        else:
            results.add_pass("E1: SEED_KEY unset", "SEED_KEY not present in .env")
    except Exception as e:
        results.add_fail("E1: SEED_KEY check", f"Exception: {e}")
    
    # Test 2: Static verify seed guard
    print("\n[E2] Static verify seed guard in route.js")
    try:
        result = subprocess.run(
            ["grep", "-A", "10", "route === '/seed'", "/app/app/api/[[...path]]/route.js"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        guard_code = result.stdout
        print(f"  Found seed route handler")
        
        # Check for production guard
        if "IS_PRODUCTION" in guard_code or "NODE_ENV" in guard_code:
            if "SEED_KEY" in guard_code:
                if "deleteMany" in guard_code:
                    # Check order: guard should come BEFORE deleteMany
                    guard_pos = guard_code.find("SEED_KEY")
                    delete_pos = guard_code.find("deleteMany")
                    if guard_pos < delete_pos:
                        results.add_pass("E2: Seed guard order", "Guard check BEFORE deleteMany")
                    else:
                        results.add_fail("E2: Seed guard order", "deleteMany appears BEFORE guard check")
                else:
                    results.add_pass("E2: Seed guard present", "Production guard with SEED_KEY check found")
            else:
                results.add_fail("E2: Seed guard present", "Production check found but no SEED_KEY verification")
        else:
            results.add_fail("E2: Seed guard present", "No production guard found in seed route")
    except Exception as e:
        results.add_fail("E2: Seed guard verification", f"Exception: {e}")

def test_full_regression(results: TestResults):
    """
    Test F) Full regression sanity
    - POST /auth/signup → 201 + JWT
    - POST /auth/login → 200 + JWT
    - GET /vendors (no auth) → 200 array, length ≥ 32
    - GET /events without auth → 401
    - GET /events with Bearer → 200
    - GET /admin/stats with customer Bearer → 403
    - Data preservation: vendors ≥ 32, reviews ≥ 4
    """
    print("\n" + "="*80)
    print("TEST F) FULL REGRESSION SANITY - Core flows working")
    print("="*80)
    
    # Wait for rate limits to reset from previous tests
    print("\n⏳ Waiting 65 seconds for rate limits to reset...")
    time.sleep(65)
    
    timestamp = int(time.time())
    test_email = f"regression-test-{timestamp}@test.com"
    test_password = "testpass123"
    jwt_token = None
    
    # Test 1: Signup
    print("\n[F1] POST /auth/signup")
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/signup",
            json={"name": "Regression Test", "email": test_email, "password": test_password},
            timeout=10
        )
        print(f"  Status: {resp.status_code}")
        
        if resp.status_code == 201:
            body = resp.json()
            if "token" in body and "user" in body:
                jwt_token = body["token"]
                results.add_pass("F1: Signup", f"201 + JWT received")
            else:
                results.add_fail("F1: Signup", f"201 but missing token or user in response")
        elif resp.status_code == 429:
            results.add_fail("F1: Signup", f"Still rate limited (429) - rate limit window may be longer")
        else:
            results.add_fail("F1: Signup", f"Expected 201, got {resp.status_code}")
    except Exception as e:
        results.add_fail("F1: Signup", f"Exception: {e}")
    
    # Test 2: Login
    print("\n[F2] POST /auth/login")
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": test_email, "password": test_password},
            timeout=10
        )
        print(f"  Status: {resp.status_code}")
        
        if resp.status_code == 200:
            body = resp.json()
            if "token" in body:
                results.add_pass("F2: Login", f"200 + JWT received")
            else:
                results.add_fail("F2: Login", f"200 but missing token")
        elif resp.status_code == 429:
            results.add_fail("F2: Login", f"Still rate limited (429)")
        else:
            results.add_fail("F2: Login", f"Expected 200, got {resp.status_code}")
    except Exception as e:
        results.add_fail("F2: Login", f"Exception: {e}")
    
    # Test 3: GET /vendors (public) - returns array directly
    print("\n[F3] GET /vendors (no auth)")
    try:
        resp = requests.get(f"{BASE_URL}/vendors", timeout=10)
        print(f"  Status: {resp.status_code}")
        
        if resp.status_code == 200:
            vendors = resp.json()
            # /vendors returns array directly, not {vendors: [...]}
            if isinstance(vendors, list):
                print(f"  Vendor count: {len(vendors)}")
                if len(vendors) >= 32:
                    results.add_pass("F3: GET vendors", f"200 with {len(vendors)} vendors (≥32)")
                else:
                    results.add_fail("F3: GET vendors", f"Got {len(vendors)} vendors, expected ≥32")
            else:
                results.add_fail("F3: GET vendors", f"Expected array, got {type(vendors)}")
        else:
            results.add_fail("F3: GET vendors", f"Expected 200, got {resp.status_code}")
    except Exception as e:
        results.add_fail("F3: GET vendors", f"Exception: {e}")
    
    # Test 4: GET /events without auth
    print("\n[F4] GET /events without Authorization")
    try:
        resp = requests.get(f"{BASE_URL}/events", timeout=10)
        print(f"  Status: {resp.status_code}")
        
        if resp.status_code == 401:
            results.add_pass("F4: Events no auth", f"Correctly returns 401")
        else:
            results.add_fail("F4: Events no auth", f"Expected 401, got {resp.status_code}")
    except Exception as e:
        results.add_fail("F4: Events no auth", f"Exception: {e}")
    
    # Test 5: GET /events with Bearer
    if jwt_token:
        print("\n[F5] GET /events with Bearer token")
        try:
            resp = requests.get(
                f"{BASE_URL}/events",
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10
            )
            print(f"  Status: {resp.status_code}")
            
            if resp.status_code == 200:
                results.add_pass("F5: Events with auth", f"200 (empty array is fine)")
            else:
                results.add_fail("F5: Events with auth", f"Expected 200, got {resp.status_code}")
        except Exception as e:
            results.add_fail("F5: Events with auth", f"Exception: {e}")
    else:
        results.add_fail("F5: Events with auth", "Skipped (no JWT from signup)")
    
    # Test 6: GET /admin/stats with customer Bearer
    if jwt_token:
        print("\n[F6] GET /admin/stats with customer Bearer")
        try:
            resp = requests.get(
                f"{BASE_URL}/admin/stats",
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10
            )
            print(f"  Status: {resp.status_code}")
            
            if resp.status_code == 403:
                results.add_pass("F6: Admin stats forbidden", f"Correctly returns 403 for customer")
            else:
                results.add_fail("F6: Admin stats forbidden", f"Expected 403, got {resp.status_code}")
        except Exception as e:
            results.add_fail("F6: Admin stats forbidden", f"Exception: {e}")
    else:
        results.add_fail("F6: Admin stats forbidden", "Skipped (no JWT)")
    
    # Test 7: Data preservation - check vendors and reviews endpoints
    print("\n[F7] Data preservation check")
    try:
        # Check vendors
        resp_vendors = requests.get(f"{BASE_URL}/vendors", timeout=10)
        vendors_count = len(resp_vendors.json()) if resp_vendors.status_code == 200 and isinstance(resp_vendors.json(), list) else 0
        
        # Check reviews
        resp_reviews = requests.get(f"{BASE_URL}/reviews", timeout=10)
        reviews_data = resp_reviews.json() if resp_reviews.status_code == 200 else []
        reviews_count = len(reviews_data) if isinstance(reviews_data, list) else len(reviews_data.get("reviews", [])) if isinstance(reviews_data, dict) else 0
        
        print(f"  Vendors: {vendors_count}, Reviews: {reviews_count}")
        
        if vendors_count >= 32 and reviews_count >= 4:
            results.add_pass("F7: Data preserved", f"vendors={vendors_count} (≥32), reviews={reviews_count} (≥4)")
        else:
            results.add_fail("F7: Data preserved", f"vendors={vendors_count} (need ≥32), reviews={reviews_count} (need ≥4)")
    except Exception as e:
        results.add_fail("F7: Data preserved", f"Exception: {e}")

def main():
    print("="*80)
    print("PRODUCTION HARDENING REGRESSION TEST SUITE")
    print("Vows & Venues - Backend API Testing")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = TestResults()
    
    # Run all test suites
    test_cors_edge_fix(results)
    test_real_google_auth(results)
    test_rate_limiting(results)
    test_jwt_secret_hygiene(results)
    test_seed_key_unset(results)
    test_full_regression(results)
    
    # Print summary
    passed, failed = results.summary()
    
    # Print detailed results
    print("\nDETAILED RESULTS:")
    print("-" * 80)
    for detail in results.details:
        status_icon = "✅" if detail["status"] == "PASS" else "❌"
        print(f"{status_icon} {detail['test']}")
        if detail["detail"]:
            print(f"   {detail['detail']}")
    
    print("\n" + "="*80)
    print(f"FINAL RESULT: {passed} passed, {failed} failed")
    print("="*80)
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())
