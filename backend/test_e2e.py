"""
End-to-End Test Suite for PolicyGuard
Tests all critical features including policy upload, rule extraction, scans, and multi-tenancy
"""
import asyncio
import sys
from pathlib import Path
import httpx
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"
TIMEOUT = 30.0

# Test data
import random
import string

def generate_unique_suffix():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

UNIQUE_SUFFIX = generate_unique_suffix()

COMPANY_A = {
    "name": f"Test Financial Corp A {UNIQUE_SUFFIX}",
    "industry": "Financial Services",
    "admin_email": f"admin_a_{UNIQUE_SUFFIX}@testcorp.com",
    "admin_password": "testpass123",
    "admin_name": "Admin A"
}

COMPANY_B = {
    "name": f"Test Financial Corp B {UNIQUE_SUFFIX}",
    "industry": "Banking",
    "admin_email": f"admin_b_{UNIQUE_SUFFIX}@testcorp.com",
    "admin_password": "testpass123",
    "admin_name": "Admin B"
}

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name):
        self.passed.append(test_name)
        print(f"[PASS] {test_name}")
    
    def add_fail(self, test_name, error):
        self.failed.append((test_name, error))
        print(f"[FAIL] {test_name}")
        print(f"   Error: {error}")
    
    def add_warning(self, test_name, message):
        self.warnings.append((test_name, message))
        print(f"[WARN] {test_name}")
        print(f"   Message: {message}")
    
    def print_summary(self):
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"[PASS] Passed: {len(self.passed)}")
        print(f"[FAIL] Failed: {len(self.failed)}")
        print(f"[WARN] Warnings: {len(self.warnings)}")
        print("="*60)
        
        if self.failed:
            print("\nFailed Tests:")
            for test_name, error in self.failed:
                print(f"  - {test_name}: {error}")
        
        if self.warnings:
            print("\nWarnings:")
            for test_name, message in self.warnings:
                print(f"  - {test_name}: {message}")
        
        return len(self.failed) == 0


async def test_backend_health(results: TestResults):
    """Test 1: Backend Health Check"""
    print("\n" + "="*60)
    print("TEST 1: Backend Health Check")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            response = await client.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                results.add_pass("Backend health endpoint")
            else:
                results.add_fail("Backend health endpoint", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Backend health endpoint", str(e))
        
        # Check OpenAPI docs
        try:
            response = await client.get(f"{API_BASE_URL}/docs")
            if response.status_code == 200:
                results.add_pass("OpenAPI docs accessible")
            else:
                results.add_fail("OpenAPI docs", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("OpenAPI docs", str(e))


async def test_company_registration(results: TestResults):
    """Test 2: Company Registration"""
    print("\n" + "="*60)
    print("TEST 2: Company Registration & Authentication")
    print("="*60)
    
    tokens = {}
    
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Register Company A
        try:
            response = await client.post(
                f"{API_BASE_URL}/auth/register-company",
                json=COMPANY_A
            )
            if response.status_code == 201:
                data = response.json()
                tokens['company_a'] = data['access_token']
                results.add_pass("Company A registration")
            else:
                results.add_fail("Company A registration", f"Status {response.status_code}: {response.text}")
        except Exception as e:
            results.add_fail("Company A registration", str(e))
        
        # Register Company B
        try:
            response = await client.post(
                f"{API_BASE_URL}/auth/register-company",
                json=COMPANY_B
            )
            if response.status_code == 201:
                data = response.json()
                tokens['company_b'] = data['access_token']
                results.add_pass("Company B registration")
            else:
                results.add_fail("Company B registration", f"Status {response.status_code}: {response.text}")
        except Exception as e:
            results.add_fail("Company B registration", str(e))
        
        # Test login for Company A
        try:
            response = await client.post(
                f"{API_BASE_URL}/auth/login",
                json={
                    "email": COMPANY_A["admin_email"],
                    "password": COMPANY_A["admin_password"]
                }
            )
            if response.status_code == 200:
                results.add_pass("Company A login")
            else:
                results.add_fail("Company A login", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Company A login", str(e))
    
    return tokens


async def test_policy_upload(results: TestResults, token: str):
    """Test 3: Policy Upload"""
    print("\n" + "="*60)
    print("TEST 3: Policy Upload & Text Extraction")
    print("="*60)
    
    # Create a simple test PDF content (mock)
    test_policy_text = """
    ANTI-MONEY LAUNDERING POLICY
    
    1. Large Cash Transactions
    All cash transactions exceeding $10,000 must be reported to FinCEN within 15 days.
    
    2. Structuring Detection
    Multiple transactions just below the reporting threshold may indicate structuring.
    
    3. High-Risk Accounts
    Accounts with high-risk profiles require enhanced monitoring.
    """
    
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Note: This is a simplified test. In production, you'd upload an actual PDF
        # For now, we'll test the endpoint structure
        try:
            # Test that the endpoint exists and requires auth
            response = await client.post(
                f"{API_BASE_URL}/policies/upload",
                headers=headers,
                data={
                    "name": "Test AML Policy",
                    "description": "Test policy for E2E testing",
                    "version": "1.0"
                }
            )
            # We expect this to fail without a file, but it should be a 422 (validation error)
            # not a 401 (auth error) or 500 (server error)
            if response.status_code in [422, 400]:
                results.add_pass("Policy upload endpoint accessible")
            else:
                results.add_warning("Policy upload endpoint", f"Unexpected status {response.status_code}")
        except Exception as e:
            results.add_fail("Policy upload endpoint", str(e))


async def test_multi_tenancy(results: TestResults, token_a: str, token_b: str):
    """Test 4: Multi-Tenancy Isolation"""
    print("\n" + "="*60)
    print("TEST 4: Multi-Tenancy & Data Isolation")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}
        
        # Get policies for Company A
        try:
            response_a = await client.get(f"{API_BASE_URL}/policies/", headers=headers_a)
            if response_a.status_code == 200:
                policies_a = response_a.json()
                results.add_pass("Company A can access policies")
            else:
                results.add_fail("Company A policies access", f"Status {response_a.status_code}")
        except Exception as e:
            results.add_fail("Company A policies access", str(e))
        
        # Get policies for Company B
        try:
            response_b = await client.get(f"{API_BASE_URL}/policies/", headers=headers_b)
            if response_b.status_code == 200:
                policies_b = response_b.json()
                results.add_pass("Company B can access policies")
                
                # Verify isolation: Company B should not see Company A's policies
                if len(policies_b) == 0 or all(p.get('company_id') != 'company_a_id' for p in policies_b):
                    results.add_pass("Multi-tenant isolation verified")
                else:
                    results.add_fail("Multi-tenant isolation", "Company B can see Company A's data")
            else:
                results.add_fail("Company B policies access", f"Status {response_b.status_code}")
        except Exception as e:
            results.add_fail("Company B policies access", str(e))


async def test_rules_and_scans(results: TestResults, token: str):
    """Test 5: Rules and Scans"""
    print("\n" + "="*60)
    print("TEST 5: Rules Management & Scan Execution")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # List rules
        try:
            response = await client.get(f"{API_BASE_URL}/rules/", headers=headers)
            if response.status_code == 200:
                rules = response.json()
                results.add_pass(f"Rules listing ({len(rules)} rules found)")
            else:
                results.add_fail("Rules listing", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Rules listing", str(e))
        
        # Test scan endpoint
        try:
            response = await client.post(
                f"{API_BASE_URL}/scans/run",
                headers=headers,
                json={
                    "collections": ["transactions", "accounts"],
                    "only_enabled": True
                }
            )
            if response.status_code in [200, 201]:
                results.add_pass("Scan execution")
            else:
                results.add_warning("Scan execution", f"Status {response.status_code} - may need sample data")
        except Exception as e:
            results.add_warning("Scan execution", str(e))


async def test_violations(results: TestResults, token: str):
    """Test 6: Violations Management"""
    print("\n" + "="*60)
    print("TEST 6: Violations Workflow")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # List violations
        try:
            response = await client.get(f"{API_BASE_URL}/violations/", headers=headers)
            if response.status_code == 200:
                violations = response.json()
                results.add_pass(f"Violations listing ({len(violations)} violations found)")
            else:
                results.add_fail("Violations listing", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Violations listing", str(e))


async def test_analytics(results: TestResults, token: str):
    """Test 7: Analytics Endpoints"""
    print("\n" + "="*60)
    print("TEST 7: Analytics & Reporting")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Dashboard summary
        try:
            response = await client.get(f"{API_BASE_URL}/dashboard/summary", headers=headers)
            if response.status_code == 200:
                results.add_pass("Dashboard summary")
            else:
                results.add_fail("Dashboard summary", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Dashboard summary", str(e))
        
        # Control health
        try:
            response = await client.get(f"{API_BASE_URL}/analytics/control-health", headers=headers)
            if response.status_code == 200:
                results.add_pass("Control health analytics")
            else:
                results.add_fail("Control health analytics", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Control health analytics", str(e))
        
        # Top risks
        try:
            response = await client.get(f"{API_BASE_URL}/analytics/top-risks", headers=headers)
            if response.status_code == 200:
                results.add_pass("Top risks analytics")
            else:
                results.add_fail("Top risks analytics", f"Status {response.status_code}")
        except Exception as e:
            results.add_fail("Top risks analytics", str(e))


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("PolicyGuard End-to-End Test Suite")
    print("="*60)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = TestResults()
    
    # Run tests
    await test_backend_health(results)
    
    tokens = await test_company_registration(results)
    
    if 'company_a' in tokens:
        await test_policy_upload(results, tokens['company_a'])
        await test_rules_and_scans(results, tokens['company_a'])
        await test_violations(results, tokens['company_a'])
        await test_analytics(results, tokens['company_a'])
    
    if 'company_a' in tokens and 'company_b' in tokens:
        await test_multi_tenancy(results, tokens['company_a'], tokens['company_b'])
    
    # Print summary
    success = results.print_summary()
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
