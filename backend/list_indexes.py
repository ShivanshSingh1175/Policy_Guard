import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def list_idxs():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["policyguard"]
    
    collections = ["transactions", "accounts", "rules", "policies"]
    for coll in collections:
        print(f"\nIndexes for {coll}:")
        async for index in db[coll].list_indexes():
            print(f"  {index}")

if __name__ == "__main__":
    asyncio.run(list_idxs())
