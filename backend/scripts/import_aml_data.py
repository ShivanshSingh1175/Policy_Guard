"""
Import IBM AML dataset into MongoDB.

This script loads sample AML transaction and account data into MongoDB
for PolicyGuard compliance scanning.
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Sample data generator for demo purposes
# In production, this would load from actual IBM AML CSV files

def generate_sample_transactions(num_transactions=1000):
    """Generate sample transaction data for demo."""
    transactions = []
    base_date = datetime.now() - timedelta(days=30)
    
    transaction_types = ['WIRE', 'CASH', 'CHECK', 'ACH', 'CARD']
    
    for i in range(num_transactions):
        # Create some high-value transactions (potential violations)
        if i % 10 == 0:
            amount = random.uniform(10000, 50000)
        else:
            amount = random.uniform(100, 9999)
        
        transaction = {
            'transaction_id': f'TXN{i:06d}',
            'timestamp': base_date + timedelta(days=random.randint(0, 30), 
                                               hours=random.randint(0, 23)),
            'amount': round(amount, 2),
            'currency': 'USD',
            'transaction_type': random.choice(transaction_types),
            'src_account': f'ACC{random.randint(1, 100):04d}',
            'dst_account': f'ACC{random.randint(1, 100):04d}',
            'description': f'Transaction {i}',
            'status': 'COMPLETED',
            'label': 'normal' if amount < 10000 else 'suspicious',
        }
        transactions.append(transaction)
    
    return transactions


def generate_sample_accounts(num_accounts=100):
    """Generate sample account data for demo."""
    accounts = []
    account_types = ['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT']
    
    for i in range(1, num_accounts + 1):
        account = {
            'account_id': f'ACC{i:04d}',
            'account_type': random.choice(account_types),
            'balance': round(random.uniform(1000, 100000), 2),
            'opened_date': datetime.now() - timedelta(days=random.randint(30, 3650)),
            'status': 'ACTIVE',
            'customer_id': f'CUST{random.randint(1, 50):04d}',
            'risk_score': random.randint(1, 100),
        }
        accounts.append(account)
    
    return accounts


async def seed_example_rules(db):
    """Seed example compliance rules."""
    rules = [
        {
            'name': 'High-Value Cash Transactions',
            'description': 'Detect cash transactions over $10,000',
            'policy_id': None,
            'collection': 'transactions',
            'type': 'simple',
            'condition': {
                'amount': {'$gt': 10000},
                'transaction_type': 'CASH'
            },
            'pipeline': None,
            'severity': 'HIGH',
            'explanation': 'Cash transactions exceeding $10,000 require additional documentation and reporting under AML regulations.',
            'enabled': True,
            'version': '1.0',
            'created_at': datetime.utcnow(),
        },
        {
            'name': 'Large Wire Transfers',
            'description': 'Detect wire transfers over $10,000',
            'policy_id': None,
            'collection': 'transactions',
            'type': 'simple',
            'condition': {
                'amount': {'$gt': 10000},
                'transaction_type': 'WIRE'
            },
            'pipeline': None,
            'severity': 'MEDIUM',
            'explanation': 'Wire transfers over $10,000 should be reviewed for potential money laundering activity.',
            'enabled': True,
            'version': '1.0',
            'created_at': datetime.utcnow(),
        },
        {
            'name': 'Structuring Detection',
            'description': 'Detect multiple transactions just below $10,000 threshold',
            'policy_id': None,
            'collection': 'transactions',
            'type': 'aggregation',
            'condition': None,
            'pipeline': [
                {
                    '$match': {
                        'amount': {'$gte': 9000, '$lt': 10000}
                    }
                },
                {
                    '$group': {
                        '_id': '$src_account',
                        'count': {'$sum': 1},
                        'total_amount': {'$sum': '$amount'}
                    }
                },
                {
                    '$match': {
                        'count': {'$gte': 3}
                    }
                }
            ],
            'severity': 'CRITICAL',
            'explanation': 'Multiple transactions just below the $10,000 reporting threshold may indicate structuring to avoid detection.',
            'enabled': True,
            'version': '1.0',
            'created_at': datetime.utcnow(),
        },
    ]
    
    # Clear existing rules
    await db.rules.delete_many({})
    
    # Insert new rules
    result = await db.rules.insert_many(rules)
    print(f"✓ Inserted {len(result.inserted_ids)} example rules")
    
    return result.inserted_ids


async def main():
    """Main import function."""
    print("=" * 60)
    print("PolicyGuard - IBM AML Dataset Import")
    print("=" * 60)
    
    # Connect to MongoDB
    print(f"\n1. Connecting to MongoDB at {settings.MONGO_URI}...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✓ Connected to MongoDB successfully")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return
    
    # Generate and import transactions
    print("\n2. Generating sample transaction data...")
    transactions = generate_sample_transactions(1000)
    print(f"✓ Generated {len(transactions)} sample transactions")
    
    print("3. Importing transactions into MongoDB...")
    await db.transactions.delete_many({})  # Clear existing
    result = await db.transactions.insert_many(transactions)
    print(f"✓ Imported {len(result.inserted_ids)} transactions")
    
    # Create indexes
    await db.transactions.create_index('transaction_id', unique=True)
    await db.transactions.create_index('amount')
    await db.transactions.create_index('timestamp')
    await db.transactions.create_index('src_account')
    print("✓ Created indexes on transactions collection")
    
    # Generate and import accounts
    print("\n4. Generating sample account data...")
    accounts = generate_sample_accounts(100)
    print(f"✓ Generated {len(accounts)} sample accounts")
    
    print("5. Importing accounts into MongoDB...")
    await db.accounts.delete_many({})  # Clear existing
    result = await db.accounts.insert_many(accounts)
    print(f"✓ Imported {len(result.inserted_ids)} accounts")
    
    # Create indexes
    await db.accounts.create_index('account_id', unique=True)
    await db.accounts.create_index('customer_id')
    print("✓ Created indexes on accounts collection")
    
    # Seed example rules
    print("\n6. Seeding example compliance rules...")
    await seed_example_rules(db)
    
    # Summary
    print("\n" + "=" * 60)
    print("Import Summary:")
    print("=" * 60)
    print(f"Transactions: {await db.transactions.count_documents({})}")
    print(f"Accounts:     {await db.accounts.count_documents({})}")
    print(f"Rules:        {await db.rules.count_documents({})}")
    print("\n✓ Data import completed successfully!")
    print("\nYou can now:")
    print("  1. Start the backend: cd backend && python run.py")
    print("  2. Start the frontend: cd frontend && npm run dev")
    print("  3. Run a compliance scan from the Scans page")
    print("=" * 60)
    
    client.close()


if __name__ == '__main__':
    asyncio.run(main())
