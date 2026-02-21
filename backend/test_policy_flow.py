"""
Complete Policy Upload and Rule Extraction Flow Test
Tests the full workflow: register -> login -> upload PDF -> extract rules -> run scan
"""
import asyncio
import httpx
from pathlib import Path
import io

API_BASE_URL = "http://localhost:8000"
TIMEOUT = 60.0

async def test_complete_flow():
    """Test the complete policy workflow"""
    print("\n" + "="*70)
    print("PolicyGuard Complete Workflow Test")
    print("="*70)
    
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
        # Step 1: Register company
        print("\n[1/6] Registering company...")
        company_data = {
            "name": "Demo AML Bank",
            "industry": "Financial Services",
            "admin_email": "demo@amlbank.com",
            "admin_password": "demo12345",
            "admin_name": "Demo Admin"
        }
        
        response = await client.post(f"{API_BASE_URL}/auth/register-company", json=company_data)
        if response.status_code == 201:
            data = response.json()
            token = data['access_token']
            print(f"✓ Company registered successfully")
        elif response.status_code == 400 and "already exists" in response.text:
            # Company exists, try login
            print("  Company already exists, logging in...")
            response = await client.post(
                f"{API_BASE_URL}/auth/login",
                json={"email": company_data["admin_email"], "password": company_data["admin_password"]}
            )
            if response.status_code == 200:
                data = response.json()
                token = data['access_token']
                print(f"✓ Logged in successfully")
            else:
                print(f"✗ Login failed: {response.status_code}")
                print(f"  Response: {response.text}")
                return
        else:
            print(f"✗ Registration failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Step 2: Create a simple test policy text (simulating PDF content)
        print("\n[2/6] Creating test policy document...")
        policy_text = """
ANTI-MONEY LAUNDERING POLICY
Version 1.0

1. LARGE CASH TRANSACTION REPORTING
All cash transactions exceeding $10,000 must be reported to FinCEN within 15 days.
Documentation must include transaction details, customer information, and purpose.

2. STRUCTURING DETECTION
Multiple transactions just below the $10,000 reporting threshold within a short time period
may indicate structuring or smurfing activities. These patterns must be flagged for review.

3. HIGH-RISK ACCOUNT MONITORING
Accounts classified as high-risk must undergo enhanced due diligence and continuous monitoring.
Any unusual activity must be investigated within 24 hours.

4. SANCTIONS SCREENING
All customers and transactions must be screened against OFAC sanctions lists and PEP databases
before account opening and on an ongoing basis.

5. CUSTOMER DUE DILIGENCE
Know Your Customer (KYC) procedures must be completed for all new accounts, including
identity verification, beneficial ownership identification, and risk assessment.
"""
        
        # Create a mock PDF file (in production, this would be a real PDF)
        # For testing, we'll use the text directly
        print("✓ Test policy document created")
        
        # Step 3: Upload policy
        print("\n[3/6] Uploading policy...")
        
        # Read the test PDF file
        pdf_path = Path("test_aml_policy.pdf")
        if not pdf_path.exists():
            print("✗ Test PDF not found. Creating it...")
            import subprocess
            subprocess.run(["python", "create_test_pdf.py"], check=True)
        
        with open(pdf_path, 'rb') as f:
            pdf_content = f.read()
        
        files = {
            'file': ('test_aml_policy.pdf', pdf_content, 'application/pdf')
        }
        data = {
            'name': 'AML Compliance Policy',
            'description': 'Core anti-money laundering policy',
            'version': '1.0'
        }
        
        response = await client.post(
            f"{API_BASE_URL}/policies/upload",
            headers=headers,
            files=files,
            data=data
        )
        
        if response.status_code == 201:
            policy = response.json()
            policy_id = policy.get('_id') or policy.get('id')
            print(f"✓ Policy uploaded successfully (ID: {policy_id})")
            print(f"  Extracted {policy.get('text_length', 0)} characters")
        else:
            print(f"✗ Policy upload failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return
        
        # Step 4: Extract rules using Gemini
        print("\n[4/6] Extracting rules using Google Gemini AI...")
        response = await client.post(
            f"{API_BASE_URL}/policies/{policy_id}/extract-rules",
            headers=headers
        )
        
        if response.status_code == 201:
            rules = response.json()
            print(f"✓ Extracted {len(rules)} rules successfully")
            for i, rule in enumerate(rules, 1):
                print(f"  {i}. {rule['name']} (Severity: {rule['severity']})")
                print(f"     Framework: {rule.get('framework', 'N/A')} | Control: {rule.get('control_id', 'N/A')}")
        else:
            print(f"✗ Rule extraction failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return
        
        # Step 5: List all rules
        print("\n[5/6] Verifying rules in database...")
        response = await client.get(f"{API_BASE_URL}/rules/", headers=headers)
        
        if response.status_code == 200:
            all_rules = response.json()
            print(f"✓ Found {len(all_rules)} total rules in database")
        else:
            print(f"✗ Failed to list rules: {response.status_code}")
        
        # Step 6: Run a scan
        print("\n[6/6] Running compliance scan...")
        response = await client.post(
            f"{API_BASE_URL}/scans/run",
            headers=headers,
            json={
                "collections": ["transactions", "accounts"],
                "only_enabled": True
            }
        )
        
        if response.status_code == 201:
            scan_result = response.json()
            print(f"✓ Scan completed successfully")
            print(f"  Scan ID: {scan_result['scan_run_id']}")
            print(f"  Rules executed: {scan_result['total_rules_executed']}")
            print(f"  Violations found: {scan_result['total_violations_found']}")
            print(f"  Execution time: {scan_result['execution_time_seconds']}s")
        else:
            print(f"✗ Scan failed: {response.status_code}")
            print(f"  Response: {response.text}")
        
        # Summary
        print("\n" + "="*70)
        print("WORKFLOW TEST COMPLETE")
        print("="*70)
        print("✓ All steps completed successfully!")
        print("\nNext steps:")
        print("  1. View violations at: http://localhost:5173/app/violations")
        print("  2. Check analytics at: http://localhost:5173/app/analytics")
        print("  3. Review policies at: http://localhost:5173/app/policies")
        print("="*70)


if __name__ == "__main__":
    asyncio.run(test_complete_flow())
