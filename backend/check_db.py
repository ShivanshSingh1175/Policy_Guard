import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["policyguard"]
    
    demo_user = await db.users.find_one({"email": "demo@amlbank.com"})
    if demo_user:
        company_id = demo_user["company_id"]
        print(f"\nDemo Company ID: {company_id}")
        
        rules_count = await db.rules.count_documents({"company_id": company_id})
        print(f"Rules for demo company: {rules_count}")
        
        async for rule in db.rules.find({"company_id": company_id}):
            print(f"Rule: {rule.get('name')} | Collection: {rule.get('collection')} | Query: {rule.get('query')}")
            
        txn_count = await db.transactions.count_documents({"company_id": company_id})
        print(f"Transactions for demo company: {txn_count}")
        
        acc = await db.accounts.find_one({"company_id": company_id})
        if acc:
            print(f"Found sample account: {acc['account_id']}")
        else:
            print("No accounts found for demo company.")
    else:
        print("\nDemo user not found.")

if __name__ == "__main__":
    asyncio.run(check())
