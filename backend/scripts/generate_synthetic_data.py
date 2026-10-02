"""
Generate synthetic AML transaction data for development/testing
CLEARLY LABELED AS SYNTHETIC - NOT REAL AML DATA
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def generate_synthetic_transactions(db, company_id: str, num_transactions: int = 2000):
    """Generate synthetic transaction patterns for ML training"""
    print(f"\nGenerating {num_transactions} SYNTHETIC transactions...")
    print("⚠️  NOTE: This is SYNTHETIC data for development only")
    
    # Get existing accounts
    accounts = await db.accounts.find({"company_id": company_id}).to_list(length=None)
    if not accounts:
        print("ERROR: No accounts found. Run seed_demo_data.py first.")
        return
    
    account_ids = [acc["account_id"] for acc in accounts]
    
    transactions = []
    base_date = datetime.utcnow() - timedelta(days=60)
    
    # PATTERN 1: Normal transactions (70%)
    normal_count = int(num_transactions * 0.70)
    for i in range(normal_count):
        transactions.append({
            "company_id": company_id,
            "transaction_id": f"SYN_NORMAL_{i:06d}",
            "timestamp": base_date + timedelta(
                days=random.randint(0, 60),
                hours=random.randint(6, 22),
                minutes=random.randint(0, 59)
            ),
            "amount": round(random.uniform(50, 5000), 2),
            "currency": "USD",
            "transaction_type": random.choice(['WIRE', 'ACH', 'CHECK', 'CARD']),
            "channel": random.choice(['ONLINE', 'MOBILE', 'BRANCH']),
            "src_account": random.choice(account_ids),
            "dst_account": random.choice(account_ids),
            "description": "Normal transaction",
            "status": "COMPLETED",
            "created_at": datetime.utcnow()
        })
    
    # PATTERN 2: Structuring attempts (10%)
    structuring_count = int(num_transactions * 0.10)
    structuring_accounts = random.sample(account_ids, min(10, len(account_ids)))
    for i in range(structuring_count):
        src_account = random.choice(structuring_accounts)
        # Multiple transactions just below $10k threshold
        transactions.append({
            "company_id": company_id,
            "transaction_id": f"SYN_STRUCT_{i:06d}",
            "timestamp": base_date + timedelta(
                days=random.randint(0, 60),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            ),
            "amount": round(random.uniform(9000, 9900), 2),
            "currency": "USD",
            "transaction_type": "CASH",
            "channel": "BRANCH",
            "src_account": src_account,
            "dst_account": random.choice(account_ids),
            "description": "Cash deposit",
            "status": "COMPLETED",
            "created_at": datetime.utcnow()
        })
    
    # PATTERN 3: Rapid transfers (8%)
    rapid_count = int(num_transactions * 0.08)
    rapid_accounts = random.sample(account_ids, min(8, len(account_ids)))
    for i in range(rapid_count):
        src_account = random.choice(rapid_accounts)
        base_time = base_date + timedelta(days=random.randint(0, 60))
        # Multiple transfers in short time
        transactions.append({
            "company_id": company_id,
            "transaction_id": f"SYN_RAPID_{i:06d}",
            "timestamp": base_time + timedelta(minutes=random.randint(0, 120)),
            "amount": round(random.uniform(1000, 8000), 2),
            "currency": "USD",
            "transaction_type": random.choice(['WIRE', 'ACH']),
            "channel": "ONLINE",
            "src_account": src_account,
            "dst_account": random.choice(account_ids),
            "description": "Rapid transfer",
            "status": "COMPLETED",
            "created_at": datetime.utcnow()
        })
    
    # PATTERN 4: Round amounts (7%)
    round_count = int(num_transactions * 0.07)
    for i in range(round_count):
        # Suspiciously round amounts
        amount = random.choice([5000, 7500, 10000, 15000, 20000, 25000])
        transactions.append({
            "company_id": company_id,
            "transaction_id": f"SYN_ROUND_{i:06d}",
            "timestamp": base_date + timedelta(
                days=random.randint(0, 60),
                hours=random.randint(0, 23)
            ),
            "amount": float(amount),
            "currency": "USD",
            "transaction_type": random.choice(['WIRE', 'CASH']),
            "channel": random.choice(['BRANCH', 'ONLINE']),
            "src_account": random.choice(account_ids),
            "dst_account": random.choice(account_ids),
            "description": "Round amount transaction",
            "status": "COMPLETED",
            "created_at": datetime.utcnow()
        })
    
    # PATTERN 5: Unusual hours (5%)
    night_count = int(num_transactions * 0.05)
    for i in range(night_count):
        # Late night / early morning transactions
        hour = random.choice([0, 1, 2, 3, 4, 5, 23])
        transactions.append({
            "company_id": company_id,
            "transaction_id": f"SYN_NIGHT_{i:06d}",
            "timestamp": base_date + timedelta(
                days=random.randint(0, 60),
                hours=hour,
                minutes=random.randint(0, 59)
            ),
            "amount": round(random.uniform(2000, 15000), 2),
            "currency": "USD",
            "transaction_type": random.choice(['WIRE', 'ACH']),
            "channel": "ONLINE",
            "src_account": random.choice(account_ids),
            "dst_account": random.choice(account_ids),
            "description": "Unusual hour transaction",
            "status": "COMPLETED",
            "created_at": datetime.utcnow()
        })
    
    # Insert transactions
    if transactions:
        result = await db.transactions.insert_many(transactions)
        print(f"✓ Generated {len(result.inserted_ids)} synthetic transactions")
        print(f"  - Normal: {normal_count}")
        print(f"  - Structuring patterns: {structuring_count}")
        print(f"  - Rapid transfers: {rapid_count}")
        print(f"  - Round amounts: {round_count}")
        print(f"  - Unusual hours: {night_count}")


async def main():
    """Generate synthetic data"""
    print("=" * 70)
    print("SYNTHETIC AML DATA GENERATOR")
    print("=" * 70)
    print("\n⚠️  WARNING: This generates SYNTHETIC data for development only")
    print("            NOT based on real AML datasets")
    print("            For demonstration and testing purposes only\n")
    
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    try:
        await client.admin.command('ping')
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        return
    
    # Get first company
    company = await db.companies.find_one({})
    if not company:
        print("✗ No company found. Run seed_demo_data.py first.")
        return
    
    company_id = str(company["_id"])
    print(f"✓ Using company: {company.get('name')} ({company_id})")
    
    await generate_synthetic_transactions(db, company_id, num_transactions=2000)
    
    # Summary
    total_tx = await db.transactions.count_documents({"company_id": company_id})
    print(f"\n✓ Total transactions for company: {total_tx}")
    print("\nSynthetic data generation complete!")


if __name__ == "__main__":
    asyncio.run(main())
