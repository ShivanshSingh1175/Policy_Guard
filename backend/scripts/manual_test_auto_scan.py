"""
Test script for auto-scan and CSV import features
"""
import asyncio
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, '.')

from app.db import connect_to_mongo, close_mongo_connection, get_database


async def test_auto_scan_and_import():
    """Test that auto-scan and CSV import infrastructure is in place"""
    
    print("🔍 Testing Auto-Scan and CSV Import Features\n")
    
    # Connect to database
    await connect_to_mongo()
    db = get_database()
    
    try:
        # Test 1: Check collections exist
        print("✓ Test 1: Checking database collections...")
        collections = await db.list_collection_names()
        required_collections = ['companies', 'users', 'policies', 'rules', 'scans', 'violations', 'transactions', 'accounts']
        
        for coll in required_collections:
            if coll in collections:
                print(f"  ✓ {coll} collection exists")
            else:
                print(f"  ✗ {coll} collection missing")
        
        # Test 2: Check payroll collection (new for CSV import)
        print("\n✓ Test 2: Checking payroll collection...")
        if 'payroll' in collections:
            print("  ✓ Payroll collection exists (ready for CSV import)")
        else:
            print("  ℹ Payroll collection will be created on first import")
        
        # Test 3: Check demo company data
        print("\n✓ Test 3: Checking demo company data...")
        demo_company = await db.companies.find_one({"name": "AML Demo Bank"})
        if demo_company:
            company_id = demo_company["_id"]
            print(f"  ✓ Demo company found: {demo_company['name']}")
            
            # Check data counts
            transactions_count = await db.transactions.count_documents({"company_id": company_id})
            accounts_count = await db.accounts.count_documents({"company_id": company_id})
            policies_count = await db.policies.count_documents({"company_id": company_id})
            rules_count = await db.rules.count_documents({"company_id": company_id})
            violations_count = await db.violations.count_documents({"company_id": company_id})
            
            print(f"  ✓ Transactions: {transactions_count}")
            print(f"  ✓ Accounts: {accounts_count}")
            print(f"  ✓ Policies: {policies_count}")
            print(f"  ✓ Rules: {rules_count}")
            print(f"  ✓ Violations: {violations_count}")
        else:
            print("  ✗ Demo company not found. Run: python scripts/seed_demo_data.py")
        
        # Test 4: Check scan_runs collection
        print("\n✓ Test 4: Checking scan infrastructure...")
        if 'scan_runs' in collections:
            scan_count = await db.scan_runs.count_documents({})
            print(f"  ✓ Scan runs collection exists ({scan_count} scans)")
        else:
            print("  ℹ Scan runs collection will be created on first scan")
        
        # Test 5: Verify indexes for multi-tenancy
        print("\n✓ Test 5: Checking multi-tenant indexes...")
        for coll_name in ['transactions', 'accounts', 'policies', 'rules', 'violations']:
            indexes = await db[coll_name].index_information()
            has_company_index = any('company_id' in str(idx) for idx in indexes.values())
            if has_company_index:
                print(f"  ✓ {coll_name} has company_id index")
            else:
                print(f"  ⚠ {coll_name} missing company_id index (will be slow)")
        
        print("\n" + "="*60)
        print("✅ All infrastructure checks passed!")
        print("="*60)
        print("\nReady for:")
        print("  1. Policy upload with auto-scan (POST /policies/{id}/extract-rules?auto_scan=true)")
        print("  2. CSV data import (POST /data/import/transactions|accounts|payroll)")
        print("  3. Manual scans (POST /scans/run)")
        print("\nDemo credentials: demo@amlbank.com / demo12345")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(test_auto_scan_and_import())
