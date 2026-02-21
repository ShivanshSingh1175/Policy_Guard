import asyncio
import httpx
import os

async def test_flow():
    API_URL = "http://localhost:8000"
    
    # login
    async with httpx.AsyncClient() as client:
        print("1. Logging in...")
        resp = await client.post(f"{API_URL}/auth/login", json={
            "email": "demo@amlbank.com",
            "password": "demo12345"
        })
        if resp.status_code != 200:
            print(f"Login failed: {resp.text}")
            return
        
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # upload policy
        print("\n2. Uploading policy...")
        policy_path = "test_aml_policy.pdf"
        if not os.path.exists(policy_path):
            print(f"Policy file not found: {policy_path}")
            return
            
        with open(policy_path, "rb") as f:
            files = {"file": (policy_path, f, "application/pdf")}
            data = {
                "name": "Integration Test Policy",
                "description": "Policy uploaded during automated test",
                "version": "1.0"
            }
            resp = await client.post(f"{API_URL}/policies/upload", files=files, data=data, headers=headers)
        
        if resp.status_code != 201:
            print(f"Upload failed: {resp.status_code} - {resp.text}")
            return
        
        policy = resp.json()
        print(f"Upload response: {policy}")
        policy_id = policy.get("id") or policy.get("_id")
        print(f"✓ Policy uploaded. ID: {policy_id}")
        
        # list policies
        print("\n3. Listing policies...")
        resp = await client.get(f"{API_URL}/policies", headers=headers)
        if resp.status_code == 200:
            print(f"Found {len(resp.json())} policies")
        
        # extract rules
        print("\n4. Extracting rules...")
        resp = await client.post(f"{API_URL}/policies/{policy_id}/extract-rules", headers=headers, timeout=120.0)
        if resp.status_code == 201:
            rules = resp.json()
            print(f"✓ Extracted {len(rules)} rules")
            for r in rules:
                print(f"  - {r['name']} ({r['severity']})")
        else:
            print(f"Extraction failed: {resp.status_code} - {resp.text}")

        # run scan
        print("\n5. Running scan...")
        resp = await client.post(f"{API_URL}/scans/run", json={"collections": ["transactions"]}, headers=headers, timeout=120.0)
        if resp.status_code == 201:
            summary = resp.json()
            print(f"✓ Scan completed. Violations found: {summary['total_violations_found']}")
        else:
            print(f"Scan failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_flow())
