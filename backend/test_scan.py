import asyncio
import httpx

async def test_scan():
    API_URL = "http://localhost:8000"
    credentials = {"email": "demo@amlbank.com", "password": "demo12345"}
    
    async with httpx.AsyncClient() as client:
        # Login
        print("Logging in...")
        r = await client.post(f"{API_URL}/auth/login", json=credentials)
        if r.status_code != 200:
            print(f"Login failed: {r.status_code} - {r.text}")
            return
        
        token = r.json()["access_token"]
        print(f"Token acquired. User: {r.json()['user']['name']} (ID: {r.json()['user']['id']})")
        
        # Run Scan
        print("\nTriggering scan...")
        r = await client.post(
            f"{API_URL}/scans/run", 
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )
        print(f"Scan Status: {r.status_code}")
        print(r.text)
        
        if r.status_code == 200:
            scan_id = r.json()["scan_id"]
            print(f"Scan ID: {scan_id}")
            
            # Poll for completion
            print("\nPolling for completion...")
            for _ in range(10):
                await asyncio.sleep(2)
                r = await client.get(
                    f"{API_URL}/scans/{scan_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                status = r.json()["status"]
                print(f"Status: {status}")
                if status == "COMPLETED":
                    print("✓ Scan completed successfully!")
                    print(f"Violations found: {r.json()['violations_found']}")
                    break
                elif status == "FAILED":
                    print("✗ Scan failed!")
                    break

if __name__ == "__main__":
    asyncio.run(test_scan())
