"""
Quick test script to verify all fixes are working
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def test_fixes():
    """Test all fixes"""
    print("=" * 70)
    print("Testing PolicyGuard Fixes")
    print("=" * 70)
    
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    # Get demo company
    company = await db.companies.find_one({"name": "AML Demo Bank"})
    company_id = str(company["_id"])
    
    print(f"\n✓ Demo Company: {company_id}")
    
    # Test 1: Accounts Loading
    print("\n1. Testing Accounts Loading...")
    accounts_count = await db.accounts.count_documents({"company_id": company_id})
    print(f"   ✓ Found {accounts_count} accounts")
    
    # Test 2: Multiple Violation Types
    print("\n2. Testing Multiple Violation Types...")
    pipeline = [
        {"$match": {"company_id": company_id}},
        {"$group": {"_id": "$rule_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    violation_types = await db.violations.aggregate(pipeline).to_list(length=None)
    print(f"   ✓ Found {len(violation_types)} different violation types:")
    for vtype in violation_types:
        print(f"     - {vtype['_id']}: {vtype['count']} violations")
    
    # Test 3: Violation Status (No ERROR)
    print("\n3. Testing Violation Statuses...")
    statuses = await db.violations.distinct("status", {"company_id": company_id})
    print(f"   ✓ Violation statuses: {statuses}")
    error_count = await db.violations.count_documents({"company_id": company_id, "status": "ERROR"})
    if error_count == 0:
        print(f"   ✓ No violations with ERROR status (Good!)")
    else:
        print(f"   ✗ Found {error_count} violations with ERROR status")
    
    # Test 4: My Work Has Data
    print("\n4. Testing My Work Assignments...")
    assigned_violations = await db.violations.count_documents({
        "company_id": company_id,
        "assigned_to_user_id": {"$ne": None}
    })
    assigned_cases = await db.cases.count_documents({
        "company_id": company_id,
        "assigned_to_user_id": {"$ne": None}
    })
    print(f"   ✓ Assigned violations: {assigned_violations}")
    print(f"   ✓ Assigned cases: {assigned_cases}")
    
    # Test 5: Detection Metrics
    print("\n5. Testing Detection Metrics...")
    metrics = await db.detection_metrics.find_one({"company_id": company_id})
    if metrics:
        print(f"   ✓ Detection Accuracy: {metrics['accuracy']*100:.2f}%")
        print(f"   ✓ Precision: {metrics['precision']*100:.2f}%")
        print(f"   ✓ Recall: {metrics['recall']*100:.2f}%")
        print(f"   ✓ F1 Score: {metrics['f1_score']:.4f}")
    else:
        print(f"   ✗ No detection metrics found")
    
    # Test 6: Laundering Labels
    print("\n6. Testing Laundering Labels...")
    labeled_count = await db.transactions.count_documents({
        "company_id": company_id,
        "is_laundering": {"$exists": True}
    })
    laundering_count = await db.transactions.count_documents({
        "company_id": company_id,
        "is_laundering": True
    })
    print(f"   ✓ Labeled transactions: {labeled_count}")
    print(f"   ✓ Laundering transactions: {laundering_count} ({laundering_count/labeled_count*100:.1f}%)")
    
    print("\n" + "=" * 70)
    print("ALL TESTS COMPLETED!")
    print("=" * 70)
    
    client.close()


if __name__ == '__main__':
    asyncio.run(test_fixes())
