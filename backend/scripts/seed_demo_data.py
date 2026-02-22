"""
Demo Data Seeding Script for PolicyGuard
Creates a complete demo environment with company, users, policies, rules, scans, and violations
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.config import settings
from app.services.auth_service import hash_password


# Demo company and user credentials
DEMO_COMPANY_NAME = "AML Demo Bank"
DEMO_COMPANY_INDUSTRY = "Financial Services"
DEMO_ADMIN_EMAIL = "demo@amlbank.com"
DEMO_ADMIN_PASSWORD = "demo12345"
DEMO_ADMIN_NAME = "Demo Admin"


async def seed_demo_company(db):
    """Create or get demo company"""
    print("\n1. Setting up demo company...")
    
    # Check if demo company exists
    existing_company = await db.companies.find_one({"name": DEMO_COMPANY_NAME})
    
    if existing_company:
        company_id = str(existing_company["_id"])
        print(f"✓ Demo company already exists: {company_id}")
        return company_id
    
    # Create new company
    company_doc = {
        "name": DEMO_COMPANY_NAME,
        "industry": DEMO_COMPANY_INDUSTRY,
        "created_at": datetime.utcnow(),
        "settings": {
            "timezone": "UTC",
            "currency": "USD"
        }
    }
    
    result = await db.companies.insert_one(company_doc)
    company_id = str(result.inserted_id)
    print(f"✓ Created demo company: {company_id}")
    
    return company_id


async def seed_demo_user(db, company_id):
    """Create or get demo admin user"""
    print("\n2. Setting up demo admin user...")
    
    # Check if demo user exists
    existing_user = await db.users.find_one({"email": DEMO_ADMIN_EMAIL})
    
    if existing_user:
        user_id = str(existing_user["_id"])
        print(f"✓ Demo user already exists: {DEMO_ADMIN_EMAIL}")
        return user_id
    
    # Create new user
    user_doc = {
        "company_id": company_id,
        "email": DEMO_ADMIN_EMAIL,
        "password_hash": hash_password(DEMO_ADMIN_PASSWORD),
        "name": DEMO_ADMIN_NAME,
        "role": "ADMIN",
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    print(f"✓ Created demo user: {DEMO_ADMIN_EMAIL}")
    print(f"  Password: {DEMO_ADMIN_PASSWORD}")
    
    return user_id


async def seed_accounts(db, company_id, num_accounts=100):
    """Generate and seed account data"""
    print(f"\n3. Seeding {num_accounts} demo accounts...")
    
    # Clear existing demo accounts for this company
    await db.accounts.delete_many({"company_id": company_id})
    
    # Drop old unique index on account_id if it exists (for multi-tenancy)
    try:
        await db.accounts.drop_index("account_id_1")
        print("  ! Dropped old account_id unique index for multi-tenancy")
    except Exception:
        pass  # Index doesn't exist, that's fine
    
    account_types = ['CHECKING', 'SAVINGS', 'BUSINESS', 'INVESTMENT']
    countries = ['US', 'UK', 'CA', 'DE', 'FR', 'JP', 'AU', 'SG']
    statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'DORMANT', 'SUSPENDED']  # More active accounts
    
    accounts = []
    for i in range(1, num_accounts + 1):
        account = {
            "company_id": company_id,
            "account_id": f"ACC{i:04d}",
            "customer_name": f"Customer {i}",
            "account_type": random.choice(account_types),
            "balance": round(random.uniform(1000, 500000), 2),
            "currency": "USD",
            "country": random.choice(countries),
            "opened_date": datetime.utcnow() - timedelta(days=random.randint(30, 3650)),
            "status": random.choice(statuses),
            "customer_id": f"CUST{random.randint(1, 50):04d}",
            "risk_score": random.randint(10, 90),
            "created_at": datetime.utcnow()
        }
        accounts.append(account)
    
    result = await db.accounts.insert_many(accounts)
    print(f"✓ Seeded {len(result.inserted_ids)} accounts")
    
    return accounts


async def seed_transactions(db, company_id, accounts, num_transactions=1000):
    """Generate and seed transaction data"""
    print(f"\n4. Seeding {num_transactions} demo transactions...")
    
    # Clear existing demo transactions for this company
    await db.transactions.delete_many({"company_id": company_id})
    
    # Drop old unique index on transaction_id if it exists (for multi-tenancy)
    try:
        await db.transactions.drop_index("transaction_id_1")
        print("  ! Dropped old transaction_id unique index for multi-tenancy")
    except Exception:
        pass  # Index doesn't exist, that's fine
    
    transaction_types = ['WIRE', 'CASH', 'CHECK', 'ACH', 'CARD']
    channels = ['BRANCH', 'ATM', 'ONLINE', 'MOBILE', 'PHONE']
    base_date = datetime.utcnow() - timedelta(days=30)
    
    transactions = []
    account_ids = [acc["account_id"] for acc in accounts]
    
    for i in range(num_transactions):
        # Create some high-value transactions (potential violations)
        if i % 15 == 0:  # ~7% high-value
            amount = random.uniform(10000, 50000)
            txn_type = random.choice(['WIRE', 'CASH'])
        elif i % 20 == 0:  # ~5% structuring pattern
            amount = random.uniform(9000, 9999)
            txn_type = 'CASH'
        else:
            amount = random.uniform(100, 8000)
            txn_type = random.choice(transaction_types)
        
        transaction = {
            "company_id": company_id,
            "transaction_id": f"TXN{i:06d}",
            "timestamp": base_date + timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            ),
            "amount": round(amount, 2),
            "currency": "USD",
            "transaction_type": txn_type,
            "channel": random.choice(channels),
            "src_account": random.choice(account_ids),
            "dst_account": random.choice(account_ids),
            "description": f"Transaction {i}",
            "status": "COMPLETED",
            "created_at": datetime.utcnow()
        }
        transactions.append(transaction)
    
    result = await db.transactions.insert_many(transactions)
    print(f"✓ Seeded {len(result.inserted_ids)} transactions")
    
    return transactions


async def seed_policies(db, company_id, user_id):
    """Create demo policies"""
    print("\n5. Seeding demo policies...")
    
    # Clear existing demo policies
    await db.policies.delete_many({"company_id": company_id})
    
    policies = [
        {
            "company_id": company_id,
            "name": "Corporate AML Policy - Cash Transaction Monitoring",
            "description": "Anti-Money Laundering policy for monitoring large cash transactions and structuring patterns",
            "version": "1.0",
            "file_name": "aml_cash_monitoring_policy.pdf",
            "extracted_text": """
CORPORATE ANTI-MONEY LAUNDERING POLICY
Cash Transaction Monitoring and Reporting

1. LARGE CASH TRANSACTIONS
All cash transactions exceeding $10,000 must be reported to FinCEN within 15 days via Currency Transaction Report (CTR).
Staff must verify customer identification and document the source of funds.

2. STRUCTURING DETECTION
Multiple cash transactions just below the $10,000 threshold may indicate structuring to avoid reporting requirements.
Systems must flag accounts with 3 or more transactions between $9,000-$9,999 within a 7-day period.

3. HIGH-RISK ACCOUNT MONITORING
Accounts flagged with multiple violations require enhanced due diligence.
Compliance officers must review high-risk accounts monthly and document findings.

4. WIRE TRANSFER OVERSIGHT
International wire transfers over $10,000 require additional verification.
Beneficial ownership information must be collected and verified.
            """,
            "text_length": 850,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_id
        },
        {
            "company_id": company_id,
            "name": "High-Risk Account Management Policy",
            "description": "Policy for identifying and managing high-risk customer accounts",
            "version": "1.0",
            "file_name": "high_risk_account_policy.pdf",
            "extracted_text": """
HIGH-RISK ACCOUNT MANAGEMENT POLICY

1. RISK ASSESSMENT CRITERIA
Accounts are classified as high-risk based on:
- Geographic location (high-risk jurisdictions)
- Transaction patterns (frequency, amounts, timing)
- Customer profile (PEP status, business type)
- Violation history

2. ENHANCED DUE DILIGENCE
High-risk accounts require:
- Annual KYC refresh
- Source of wealth documentation
- Ongoing transaction monitoring
- Senior management approval for large transactions

3. SUSPICIOUS ACTIVITY REPORTING
Any suspicious patterns must be reported via SAR within 30 days of detection.
            """,
            "text_length": 650,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": user_id
        }
    ]
    
    result = await db.policies.insert_many(policies)
    policy_ids = [str(pid) for pid in result.inserted_ids]
    print(f"✓ Seeded {len(policy_ids)} policies")
    
    return policy_ids


async def seed_rules(db, company_id, policy_ids):
    """Create demo compliance rules"""
    print("\n6. Seeding demo compliance rules...")
    
    # Clear existing demo rules
    await db.rules.delete_many({"company_id": company_id})
    
    rules = [
        {
            "company_id": company_id,
            "policy_id": policy_ids[0],
            "name": "Large Cash Transactions",
            "description": "Detect cash transactions over $10,000 requiring CTR filing",
            "collection": "transactions",
            "query": {
                "amount": {"$gte": 10000},
                "transaction_type": "CASH"
            },
            "pipeline": [
                {"$match": {"amount": {"$gte": 10000}, "transaction_type": "CASH"}},
                {"$project": {"transaction_id": 1, "amount": 1, "timestamp": 1, "src_account": 1}}
            ],
            "severity": "HIGH",
            "framework": "AML",
            "control_id": "AML-CTR-01",
            "explanation": "Cash transactions exceeding $10,000 require Currency Transaction Report (CTR) filing with FinCEN within 15 days.",
            "enabled": True,
            "tags": ["aml", "cash", "ctr"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "company_id": company_id,
            "policy_id": policy_ids[0],
            "name": "Structuring Detection - Near-Threshold Transactions",
            "description": "Detect multiple transactions just below $10,000 threshold indicating potential structuring",
            "collection": "transactions",
            "query": {
                "amount": {"$gte": 9000, "$lt": 10000},
                "transaction_type": "CASH"
            },
            "pipeline": [
                {"$match": {"amount": {"$gte": 9000, "$lt": 10000}, "transaction_type": "CASH"}},
                {"$project": {"transaction_id": 1, "amount": 1, "timestamp": 1, "src_account": 1}}
            ],
            "severity": "CRITICAL",
            "framework": "AML",
            "control_id": "AML-STR-01",
            "explanation": "Multiple transactions between $9,000-$9,999 may indicate structuring to avoid CTR reporting requirements.",
            "enabled": True,
            "tags": ["aml", "structuring", "cash"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "company_id": company_id,
            "policy_id": policy_ids[0],
            "name": "Large Wire Transfers",
            "description": "Monitor wire transfers over $10,000 for AML compliance",
            "collection": "transactions",
            "query": {
                "amount": {"$gte": 10000},
                "transaction_type": "WIRE"
            },
            "pipeline": [
                {"$match": {"amount": {"$gte": 10000}, "transaction_type": "WIRE"}},
                {"$project": {"transaction_id": 1, "amount": 1, "timestamp": 1, "src_account": 1, "dst_account": 1}}
            ],
            "severity": "MEDIUM",
            "framework": "AML",
            "control_id": "AML-WIRE-01",
            "explanation": "Wire transfers over $10,000 require enhanced verification and beneficial ownership documentation.",
            "enabled": True,
            "tags": ["aml", "wire", "international"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "company_id": company_id,
            "policy_id": policy_ids[1],
            "name": "High-Value Account Activity",
            "description": "Monitor accounts with unusually high transaction volumes",
            "collection": "accounts",
            "query": {
                "balance": {"$gte": 100000},
                "status": "ACTIVE"
            },
            "pipeline": [
                {"$match": {"balance": {"$gte": 100000}, "status": "ACTIVE"}},
                {"$project": {"account_id": 1, "balance": 1, "account_type": 1, "risk_score": 1}}
            ],
            "severity": "LOW",
            "framework": "AML",
            "control_id": "AML-HR-01",
            "explanation": "High-balance accounts require enhanced monitoring and periodic KYC refresh.",
            "enabled": True,
            "tags": ["aml", "high-risk", "monitoring"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    result = await db.rules.insert_many(rules)
    rule_ids = [str(rid) for rid in result.inserted_ids]
    print(f"✓ Seeded {len(rule_ids)} compliance rules")
    
    return rule_ids


async def run_demo_scan(db, company_id, rule_ids, user_id):
    """Execute a demo scan to generate violations"""
    print("\n7. Running demo compliance scan...")
    
    # Import scan logic inline to avoid global db dependency
    from app.models.scan import ScanStatus, RuleScanResult
    from bson import ObjectId
    import time
    
    scan_start_time = time.time()
    
    # Load enabled rules
    rule_filter = {
        "enabled": True,
        "company_id": company_id
    }
    
    rules_cursor = db.rules.find(rule_filter)
    rules = await rules_cursor.to_list(length=None)
    
    if not rules:
        print("  ! No enabled rules found. Skipping scan...")
        return None
    
    # Create scan run document
    scan_run_doc = {
        "company_id": company_id,
        "status": ScanStatus.RUNNING,
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "total_rules_executed": 0,
        "total_violations_found": 0,
        "collections_scanned": list(set([r["collection"] for r in rules])),
        "rule_results": []
    }
    scan_run_result = await db.scan_runs.insert_one(scan_run_doc)
    scan_run_id = str(scan_run_result.inserted_id)
    
    # Execute each rule
    rule_results = []
    total_violations = 0
    
    for rule in rules:
        rule_start = time.time()
        rule_id = str(rule["_id"])
        
        try:
            # Execute rule query
            collection_name = rule["collection"]
            query = rule["query"]
            
            # Check if collection exists
            collection_names = await db.list_collection_names()
            if collection_name not in collection_names:
                continue
            
            # Execute query with company_id scope
            target_collection = db[collection_name]
            scoped_query = query.copy()
            scoped_query["company_id"] = company_id
            
            cursor = target_collection.find(scoped_query)
            matching_docs = await cursor.to_list(length=None)
            
            # Create violation records
            violations_count = 0
            now = datetime.utcnow()
            
            # Generate remediation suggestions based on rule type
            remediation_suggestions = []
            if "Cash" in rule["name"]:
                remediation_suggestions = [
                    "Request additional KYC documentation from customer",
                    "File Currency Transaction Report (CTR) with FinCEN within 15 days",
                    "Review customer's transaction history for patterns"
                ]
            elif "Structuring" in rule["name"]:
                remediation_suggestions = [
                    "Escalate to senior compliance officer for SAR filing review",
                    "Conduct enhanced due diligence on customer account",
                    "Schedule customer interview to verify source of funds"
                ]
            elif "Wire" in rule["name"]:
                remediation_suggestions = [
                    "Verify beneficial ownership information",
                    "Review international wire transfer documentation",
                    "Check OFAC sanctions list for counterparty"
                ]
            else:
                remediation_suggestions = [
                    "Review account activity for unusual patterns",
                    "Update customer risk profile",
                    "Document findings in compliance management system"
                ]
            
            # Auto-assign some violations to demo user
            for idx, doc in enumerate(matching_docs):
                # Assign every 3rd violation to demo user
                assigned_to_user_id = user_id if idx % 3 == 0 else None
                assigned_to_user_name = DEMO_ADMIN_NAME if idx % 3 == 0 else None
                
                violation_doc = {
                    "company_id": company_id,
                    "scan_run_id": scan_run_id,
                    "rule_id": rule_id,
                    "rule_name": rule["name"],
                    "collection": collection_name,
                    "document_id": str(doc.get("_id", "unknown")),
                    "document_data": {k: str(v) if isinstance(v, ObjectId) else v for k, v in doc.items()},
                    "severity": rule["severity"],
                    "status": "OPEN",  # Changed from ERROR to OPEN
                    "explanation": rule.get("explanation", f"Violation detected by rule: {rule['name']}"),
                    "remediation_suggestions": remediation_suggestions,
                    "assigned_to_user_id": assigned_to_user_id,
                    "assigned_to_user_name": assigned_to_user_name,
                    "reviewer_note": None,
                    "reviewed_by": None,
                    "reviewed_at": None,
                    "created_at": now,
                    "updated_at": now
                }
                
                await db.violations.insert_one(violation_doc)
                violations_count += 1
            
            total_violations += violations_count
            
            rule_result = {
                "rule_id": rule_id,
                "rule_name": rule["name"],
                "collection": collection_name,
                "violations_found": violations_count,
                "execution_time_ms": (time.time() - rule_start) * 1000
            }
            rule_results.append(rule_result)
            
        except Exception as e:
            print(f"  ! Error executing rule {rule_id}: {str(e)}")
            rule_results.append({
                "rule_id": rule_id,
                "rule_name": rule["name"],
                "collection": rule["collection"],
                "violations_found": 0,
                "execution_time_ms": (time.time() - rule_start) * 1000
            })
    
    # Update scan run with results
    scan_end_time = datetime.utcnow()
    await db.scan_runs.update_one(
        {"_id": ObjectId(scan_run_id)},
        {
            "$set": {
                "status": ScanStatus.COMPLETED,
                "completed_at": scan_end_time,
                "total_rules_executed": len(rules),
                "total_violations_found": total_violations,
                "rule_results": rule_results
            }
        }
    )
    
    execution_time = time.time() - scan_start_time
    
    print(f"✓ Scan completed: {scan_run_id}")
    print(f"  - Rules executed: {len(rules)}")
    print(f"  - Violations found: {total_violations}")
    print(f"  - Auto-assigned to demo user: {total_violations // 3}")
    print(f"  - Execution time: {round(execution_time, 2)}s")
    
    return scan_run_id


async def seed_cases(db, company_id, user_id):
    """Create demo investigation cases"""
    print("\n8. Seeding demo investigation cases...")
    
    # Clear existing demo cases
    await db.cases.delete_many({"company_id": company_id})
    
    # Get some violations to link to cases
    violations = await db.violations.find({"company_id": company_id}).limit(10).to_list(length=10)
    
    if len(violations) < 3:
        print("  ! Not enough violations to create cases. Skipping...")
        return []
    
    cases = [
        {
            "company_id": company_id,
            "title": "Large Cash Transaction Investigation - ACC0023",
            "description": "Multiple large cash deposits detected on account ACC0023. Investigating source of funds and customer business activity.",
            "status": "OPEN",
            "severity": "HIGH",
            "primary_account_id": "ACC0023",
            "assigned_to_user_id": user_id,
            "assigned_to_user_name": DEMO_ADMIN_NAME,
            "violation_ids": [str(violations[0]["_id"]), str(violations[1]["_id"])],
            "comments": [
                {
                    "user_id": user_id,
                    "user_name": DEMO_ADMIN_NAME,
                    "comment": "Initiated investigation. Requesting additional KYC documentation from customer.",
                    "created_at": datetime.utcnow() - timedelta(hours=2)
                }
            ],
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "company_id": company_id,
            "title": "Potential Structuring Pattern - ACC0045",
            "description": "Account ACC0045 shows pattern of multiple cash transactions just below $10,000 threshold over 7-day period.",
            "status": "IN_REVIEW",
            "severity": "CRITICAL",
            "primary_account_id": "ACC0045",
            "assigned_to_user_id": user_id,
            "assigned_to_user_name": DEMO_ADMIN_NAME,
            "violation_ids": [str(violations[2]["_id"]), str(violations[3]["_id"]), str(violations[4]["_id"])],
            "comments": [
                {
                    "user_id": user_id,
                    "user_name": DEMO_ADMIN_NAME,
                    "comment": "Clear structuring pattern identified. Escalating to compliance officer.",
                    "created_at": datetime.utcnow() - timedelta(days=1)
                },
                {
                    "user_id": user_id,
                    "user_name": DEMO_ADMIN_NAME,
                    "comment": "Customer interview scheduled for next week. Preparing SAR documentation.",
                    "created_at": datetime.utcnow() - timedelta(hours=5)
                }
            ],
            "created_at": datetime.utcnow() - timedelta(days=3),
            "updated_at": datetime.utcnow() - timedelta(hours=5)
        }
    ]
    
    result = await db.cases.insert_many(cases)
    case_ids = [str(cid) for cid in result.inserted_ids]
    print(f"✓ Seeded {len(case_ids)} investigation cases (all assigned to demo user)")
    
    return case_ids


async def update_violation_statuses(db, company_id):
    """Update some violations to different statuses for demo variety"""
    print("\n9. Updating violation statuses for demo variety...")
    
    violations = await db.violations.find({"company_id": company_id}).to_list(length=None)
    
    if not violations:
        print("  ! No violations found. Skipping...")
        return
    
    # Update some to CONFIRMED
    confirmed_count = min(len(violations) // 3, 20)
    for i in range(confirmed_count):
        await db.violations.update_one(
            {"_id": violations[i]["_id"]},
            {
                "$set": {
                    "status": "CONFIRMED",
                    "reviewed_at": datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                    "reviewer_note": "Confirmed violation. Customer contacted for documentation."
                }
            }
        )
    
    # Update some to DISMISSED
    dismissed_count = min(len(violations) // 10, 10)
    for i in range(confirmed_count, confirmed_count + dismissed_count):
        if i < len(violations):
            await db.violations.update_one(
                {"_id": violations[i]["_id"]},
                {
                    "$set": {
                        "status": "DISMISSED",
                        "reviewed_at": datetime.utcnow() - timedelta(hours=random.randint(1, 72)),
                        "reviewer_note": "False positive. Transaction verified as legitimate business activity."
                    }
                }
            )
    
    print(f"✓ Updated {confirmed_count} violations to CONFIRMED")
    print(f"✓ Updated {dismissed_count} violations to DISMISSED")


async def create_indexes(db):
    """Create necessary indexes for performance"""
    print("\n10. Creating database indexes...")
    
    try:
        # Companies
        await db.companies.create_index("name")
        
        # Users
        await db.users.create_index([("company_id", 1), ("email", 1)], unique=True)
        
        # Accounts
        await db.accounts.create_index([("company_id", 1), ("account_id", 1)])
        await db.accounts.create_index("risk_score")
        
        # Transactions
        await db.transactions.create_index([("company_id", 1), ("timestamp", -1)])
        await db.transactions.create_index([("company_id", 1), ("src_account", 1)])
        await db.transactions.create_index("amount")
        
        # Policies
        await db.policies.create_index("company_id")
        
        # Rules
        await db.rules.create_index([("company_id", 1), ("enabled", 1)])
        
        # Violations
        await db.violations.create_index([("company_id", 1), ("status", 1)])
        await db.violations.create_index([("company_id", 1), ("severity", 1)])
        await db.violations.create_index([("company_id", 1), ("created_at", -1)])
        
        # Scan runs
        await db.scan_runs.create_index([("company_id", 1), ("started_at", -1)])
        
        # Cases
        await db.cases.create_index([("company_id", 1), ("status", 1)])
        
        print("✓ Database indexes created")
    except Exception as e:
        print(f"  ! Note: Some indexes may already exist: {str(e)}")


async def main():
    """Main seeding function"""
    print("=" * 70)
    print("PolicyGuard - Demo Data Seeding Script")
    print("=" * 70)
    
    # Connect to MongoDB
    print(f"\nConnecting to MongoDB at {settings.MONGO_URI}...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    try:
        await client.admin.command('ping')
        print("✓ Connected to MongoDB successfully")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return
    
    try:
        # Seed data
        company_id = await seed_demo_company(db)
        user_id = await seed_demo_user(db, company_id)
        accounts = await seed_accounts(db, company_id, num_accounts=100)
        transactions = await seed_transactions(db, company_id, accounts, num_transactions=1000)
        policy_ids = await seed_policies(db, company_id, user_id)
        rule_ids = await seed_rules(db, company_id, policy_ids)
        scan_run_id = await run_demo_scan(db, company_id, rule_ids, user_id)
        case_ids = await seed_cases(db, company_id, user_id)
        await update_violation_statuses(db, company_id)
        await create_indexes(db)
        
        # Summary
        print("\n" + "=" * 70)
        print("DEMO DATA SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print(f"\nDemo Company ID: {company_id}")
        print(f"Demo Company Name: {DEMO_COMPANY_NAME}")
        print(f"\nLogin Credentials:")
        print(f"  Email: {DEMO_ADMIN_EMAIL}")
        print(f"  Password: {DEMO_ADMIN_PASSWORD}")
        print(f"\nData Summary:")
        print(f"  - Accounts: {await db.accounts.count_documents({'company_id': company_id})}")
        print(f"  - Transactions: {await db.transactions.count_documents({'company_id': company_id})}")
        print(f"  - Policies: {await db.policies.count_documents({'company_id': company_id})}")
        print(f"  - Rules: {await db.rules.count_documents({'company_id': company_id})}")
        print(f"  - Violations: {await db.violations.count_documents({'company_id': company_id})}")
        print(f"  - Cases: {await db.cases.count_documents({'company_id': company_id})}")
        print(f"  - Scan Runs: {await db.scan_runs.count_documents({'company_id': company_id})}")
        print(f"\nYou can now:")
        print(f"  1. Start the backend: cd backend && python run.py")
        print(f"  2. Start the frontend: cd frontend && npm run dev")
        print(f"  3. Login at http://localhost:5173/login")
        print(f"  4. Explore the populated dashboard, violations, accounts, and analytics!")
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == '__main__':
    asyncio.run(main())
