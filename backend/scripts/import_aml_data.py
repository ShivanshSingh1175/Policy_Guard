import asyncio
import sys
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Sample data generator for demo purposes
# In production, this would load from actual IBM AML CSV files

def generate_sample_transactions(company_id=None, num_transactions=1000):
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
        if company_id:
            transaction['company_id'] = company_id
        transactions.append(transaction)
    
    return transactions


def generate_sample_accounts(company_id=None, num_accounts=100):
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
        if company_id:
            account['company_id'] = company_id
        accounts.append(account)
    
    return accounts


async def seed_example_rules(db, company_id=None):
    """Seed example compliance rules."""
    rules = [
        {
            'name': 'High-Value Cash Transactions',
            'description': 'Detect cash transactions over $10,000',
            'policy_id': None,
            'collection': 'transactions',
            'query': {
                'amount': {'$gt': 10000},
                'transaction_type': 'CASH'
            },
            'severity': 'HIGH',
            'explanation': 'Cash transactions exceeding $10,000 require additional documentation and reporting under AML regulations.',
            'enabled': True,
            'version': '1.0',
            'created_at': datetime.utcnow(),
            'tags': ['aml', 'high-value']
        },
        {
            'name': 'Large Wire Transfers',
            'description': 'Detect wire transfers over $10,000',
            'policy_id': None,
            'collection': 'transactions',
            'query': {
                'amount': {'$gt': 10000},
                'transaction_type': 'WIRE'
            },
            'severity': 'MEDIUM',
            'explanation': 'Wire transfers over $10,000 should be reviewed for potential money laundering activity.',
            'enabled': True,
            'version': '1.0',
            'created_at': datetime.utcnow(),
            'tags': ['aml', 'wire']
        },
        {
            'name': 'Structuring Detection',
            'description': 'Detect multiple transactions just below $10,000 threshold',
            'policy_id': None,
            'collection': 'transactions',
            'query': {
                'amount': {'$gte': 9000, '$lt': 10000}
            },
            'severity': 'CRITICAL',
            'explanation': 'Multiple transactions just below the $10,000 reporting threshold may indicate structuring to avoid detection.',
            'enabled': True,
            'version': '1.0',
            'created_at': datetime.utcnow(),
            'tags': ['aml', 'structuring']
        },
    ]
    
    for rule in rules:
        if company_id:
            rule['company_id'] = company_id
    
    # Clear existing rules for this company
    filter_dict = {"company_id": company_id} if company_id else {}
    await db.rules.delete_many(filter_dict)
    
    # Insert new rules
    result = await db.rules.insert_many(rules)
    print(f"✓ Inserted {len(result.inserted_ids)} example rules")
    
    return result.inserted_ids


async def main():
    """Main import function."""
    parser = argparse.ArgumentParser(description='Import AML data for a specific company')
    parser.add_argument('--company-id', type=str, help='Company ID to scope the data to')
    args = parser.parse_args()
    
    company_id = args.company_id
    
    print("=" * 60)
    print("PolicyGuard - IBM AML Dataset Import")
    if company_id:
        print(f"Scoping data to company: {company_id}")
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
    
    # Prefix IDs with company ID subset to ensure global uniqueness in multi-tenant setup
    id_prefix = (str(company_id)[:4] + "-") if company_id else ""
    
    filter_dict = {"company_id": company_id} if company_id else {}
    
    # Generate and import transactions
    print("\n2. Generating sample transaction data...")
    transactions = generate_sample_transactions(company_id, 1000)
    # Ensure IDs are unique across companies and match account ID format
    for i, t in enumerate(transactions):
        t['transaction_id'] = f"{id_prefix}TXN{i:06d}"
        if 'src_account' in t and t['src_account'].startswith('ACC'):
            t['src_account'] = f"{id_prefix}{t['src_account']}"
        if 'dst_account' in t and t['dst_account'].startswith('ACC'):
            t['dst_account'] = f"{id_prefix}{t['dst_account']}"
    
    print(f"✓ Generated {len(transactions)} sample transactions")
    
    print("3. Importing transactions into MongoDB...")
    await db.transactions.delete_many(filter_dict)  # Clear existing for this company
    try:
        result = await db.transactions.insert_many(transactions)
        print(f"✓ Imported {len(result.inserted_ids)} transactions")
    except Exception as e:
        print(f"✗ Failed to import transactions: {e}")
        if hasattr(e, 'details'):
            print(f"  Details: {e.details}")
    
    # Create indexes - safely
    async def safe_create_index(collection, keys, **kwargs):
        try:
            await collection.create_index(keys, **kwargs)
        except Exception as e:
            print(f"  ! Note on index {keys}: {str(e)}")

    print("Checking indexes...")
    await safe_create_index(db.transactions, 'transaction_id')
    await safe_create_index(db.transactions, 'amount')
    await safe_create_index(db.transactions, 'timestamp')
    await safe_create_index(db.transactions, 'src_account')
    if company_id:
        await safe_create_index(db.transactions, 'company_id')
    
    # Generate and import accounts
    print("\n4. Generating sample account data...")
    accounts = generate_sample_accounts(company_id, 100)
    # Ensure IDs are unique across companies
    for i, a in enumerate(accounts):
        a['account_id'] = f"{id_prefix}ACC{i:04d}"
        
    print(f"✓ Generated {len(accounts)} sample accounts")
    
    print("5. Importing accounts into MongoDB...")
    await db.accounts.delete_many(filter_dict)  # Clear existing for this company
    try:
        result = await db.accounts.insert_many(accounts)
        print(f"✓ Imported {len(result.inserted_ids)} accounts")
    except Exception as e:
        print(f"✗ Failed to import accounts: {e}")
        if hasattr(e, 'details'):
            print(f"  Details: {e.details}")
    
    # Create indexes - safely
    await safe_create_index(db.accounts, 'account_id')
    await safe_create_index(db.accounts, 'customer_id')
    if company_id:
        await safe_create_index(db.accounts, 'company_id')
    print("✓ Index check on accounts collection done")
    
    # Seed example rules
    print("\n6. Seeding example compliance rules...")
    await seed_example_rules(db, company_id)
    
    # Summary
    print("\n" + "=" * 60)
    print("Import Summary:")
    print("=" * 60)
    print(f"Transactions: {await db.transactions.count_documents(filter_dict)}")
    print(f"Accounts:     {await db.accounts.count_documents(filter_dict)}")
    print(f"Rules:        {await db.rules.count_documents(filter_dict)}")
    print("\n✓ Data import completed successfully!")
    print("\n=" * 60)
    
    client.close()


if __name__ == '__main__':
    asyncio.run(main())
