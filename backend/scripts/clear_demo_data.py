"""
Clear all demo data for fresh re-seeding
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

DEMO_COMPANY_NAME = "AML Demo Bank"

async def main():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    try:
        await client.admin.command('ping')
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"✗ Failed to connect: {e}")
        return
    
    # Find demo company
    company = await db.companies.find_one({"name": DEMO_COMPANY_NAME})
    
    if not company:
        print(f"✗ Demo company '{DEMO_COMPANY_NAME}' not found")
        return
    
    company_id = str(company["_id"])
    print(f"\nClearing all data for company: {company_id}")
    
    # Delete all data for this company
    collections_to_clear = [
        "accounts", "transactions", "policies", "rules", 
        "violations", "scan_runs", "cases", "alert_configs", "scan_schedules"
    ]
    
    for coll_name in collections_to_clear:
        result = await db[coll_name].delete_many({"company_id": company_id})
        print(f"✓ Cleared {result.deleted_count} documents from {coll_name}")
    
    print(f"\n✓ All data cleared for {DEMO_COMPANY_NAME}")
    print("You can now run: python scripts/seed_demo_data.py")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(main())
