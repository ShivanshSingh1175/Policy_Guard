import asyncio
import httpx

async def test_account():
    API_URL = "http://localhost:8000"
    acc_id = "699a-ACC0001"
    
    async with httpx.AsyncClient() as client:
        # login
        resp = await client.post(f"{API_URL}/auth/login", json={
            "email": "demo@amlbank.com",
            "password": "demo12345"
        })
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # get account detail
        print(f"Fetching detail for {acc_id}...")
        resp = await client.get(f"{API_URL}/accounts/{acc_id}", headers=headers)
        if resp.status_code == 200:
            detail = resp.json()
            print(f"Success! Account ID: {detail['account_id']}")
            print(f"Risk Score: {detail['risk_score']['risk_score']}")
            print(f"Recent Violations: {len(detail['recent_violations'])}")
            for v in detail['recent_violations']:
                print(f"  - {v['rule_name']} ({v['severity']})")
        else:
            print(f"Failed: {resp.status_code} - {resp.text}")

        # check analytics
        print("\nChecking Analytics...")
        resp = await client.get(f"{API_URL}/analytics/control-health", headers=headers)
        if resp.status_code == 200:
            print(f"Control Health: Found {len(resp.json())} rules")
        else:
            print(f"Analytics failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_account())
