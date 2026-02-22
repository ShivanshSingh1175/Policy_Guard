"""
Test the new daily structuring detection rule
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.advanced_rules import AdvancedRuleEngine


async def test_daily_structuring():
    """Test daily structuring detection"""
    print("=" * 70)
    print("Testing Daily Structuring Detection")
    print("=" * 70)
    
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    # Get demo company
    company = await db.companies.find_one({"name": "AML Demo Bank"})
    if not company:
        print("✗ Demo company not found")
        return
    
    company_id = str(company["_id"])
    print(f"\n✓ Testing with company: {company_id}")
    
    # Test the aggregation query
    engine = AdvancedRuleEngine()
    
    print("\nRunning daily structuring detection...")
    results = await engine.detect_daily_structuring(db, company_id, days_window=30)
    
    print(f"\n✓ Found {len(results)} daily structuring patterns:")
    
    for i, result in enumerate(results[:10], 1):  # Show first 10
        account_id = result.get("account_id", "unknown")
        day = result.get("day", "unknown")
        count = result.get("transaction_count", 0)
        total = result.get("daily_total", 0)
        
        print(f"\n  {i}. Account: {account_id}")
        print(f"     Date: {day}")
        print(f"     Transactions: {count}")
        print(f"     Daily Total: ${total:,.2f}")
    
    if len(results) > 10:
        print(f"\n  ... and {len(results) - 10} more patterns")
    
    # Test the raw aggregation query you provided
    print("\n" + "=" * 70)
    print("Testing Raw Aggregation Query")
    print("=" * 70)
    
    pipeline = [
        {
            "$match": {
                "company_id": company_id
            }
        },
        {
            "$group": {
                "_id": {
                    "account_id": "$src_account",
                    "day": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$timestamp"
                        }
                    }
                },
                "count": {"$sum": 1},
                "total": {"$sum": "$amount"}
            }
        },
        {
            "$match": {
                "count": {"$gte": 3},
                "total": {"$lt": 10000}
            }
        }
    ]
    
    raw_results = await db.transactions.aggregate(pipeline).to_list(length=None)
    
    print(f"\n✓ Raw query found {len(raw_results)} patterns")
    
    for i, result in enumerate(raw_results[:5], 1):
        account_id = result["_id"]["account_id"]
        day = result["_id"]["day"]
        count = result["count"]
        total = result["total"]
        
        print(f"\n  {i}. Account: {account_id}, Day: {day}")
        print(f"     Transactions: {count}, Total: ${total:,.2f}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETED!")
    print("=" * 70)
    
    client.close()


if __name__ == '__main__':
    asyncio.run(test_daily_structuring())
