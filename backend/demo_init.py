import asyncio
import json
import httpx
import sys
import os
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

async def init_demo():
    print("=" * 60)
    print("PolicyGuard - Demo Registration & Data Initialization")
    print("=" * 60)
    
    API_URL = "http://localhost:8000"
    
    demo_company = {
        "name": "Demo Financial Corp",
        "industry": "Financial Services",
        "admin_email": "demo@amlbank.com",
        "admin_password": "demo12345",
        "admin_name": "Demo Admin"
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Register Company
        print(f"\n1. Registering demo company: {demo_company['name']}...")
        try:
            response = await client.post(f"{API_URL}/auth/register-company", json=demo_company, timeout=10.0)
            if response.status_code == 201:
                data = response.json()
                company_id = data['user']['company_id']
                print(f"✓ Company registered successfully! ID: {company_id}")
            elif response.status_code == 400 and "already exists" in response.text:
                print("! Company already exists. Logging in to get ID...")
                login_resp = await client.post(f"{API_URL}/auth/login", json={
                    "email": demo_company["admin_email"],
                    "password": demo_company["admin_password"]
                })
                data = login_resp.json()
                company_id = data['user']['company_id']
                print(f"✓ Logged in. Company ID: {company_id}")
            else:
                print(f"✗ Failed to register: {response.status_code} - {response.text}")
                return
        except Exception as e:
            print(f"✗ Error connecting to backend: {e}")
            print("  Make sure the backend is running on http://localhost:8000")
            return

        # 2. Import Data
        print(f"\n2. Importing sample AML data for company {company_id}...")
        
        # Run the import script as a subprocess to keep it clean
        import subprocess
        try:
            cmd = [sys.executable, "scripts/import_aml_data.py", "--company-id", company_id]
            process = subprocess.run(cmd, capture_output=True, text=True)
            if process.returncode == 0:
                print(process.stdout)
                print("✓ Data import completed!")
            else:
                print(f"✗ Data import failed: {process.stderr}")
                return
        except Exception as e:
            print(f"✗ Error running import script: {e}")
            return

        print("\n" + "=" * 60)
        print("Demo Initialization Complete!")
        print("=" * 60)
        print(f"Login Email:    {demo_company['admin_email']}")
        print(f"Login Password: {demo_company['admin_password']}")
        print(f"Frontend URL:   http://localhost:5173/login")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(init_demo())
