"""
Quick test for data import endpoints
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def test_collections():
    """Test that collections exist and can be queried"""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    # Test collections
    collections = await db.list_collection_names()
    print(f"Available collections: {collections}")
    
    # Check if data import collections exist
    for coll in ['transactions', 'accounts', 'payroll']:
        count = await db[coll].count_documents({})
        print(f"{coll}: {count} documents")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_collections())
