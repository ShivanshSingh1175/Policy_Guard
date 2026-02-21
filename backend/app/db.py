"""
MongoDB connection management using motor (async driver)
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from app.config import settings


class Database:
    """MongoDB connection manager"""
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db_manager = Database()


async def connect_to_mongo():
    """Establish connection to MongoDB"""
    print(f"Connecting to MongoDB at {settings.MONGO_URI}...")
    db_manager.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_manager.db = db_manager.client[settings.MONGO_DB_NAME]
    
    # Test connection
    await db_manager.client.admin.command('ping')
    print(f"Connected to MongoDB database: {settings.MONGO_DB_NAME}")
    
    # Create indexes
    await create_indexes()


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db_manager.client:
        print("Closing MongoDB connection...")
        db_manager.client.close()
        print("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db_manager.db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo first.")
    return db_manager.db


async def create_indexes():
    """Create necessary indexes for collections"""
    db = get_database()
    
    # Policies collection indexes
    await db.policies.create_index("created_at")
    await db.policies.create_index("name")
    
    # Rules collection indexes
    await db.rules.create_index([("collection", 1), ("enabled", 1)])
    await db.rules.create_index("policy_id")
    
    # Scan runs collection indexes
    await db.scan_runs.create_index("started_at")
    await db.scan_runs.create_index("status")
    
    # Violations collection indexes
    await db.violations.create_index([("scan_run_id", 1), ("rule_id", 1)])
    await db.violations.create_index("status")
    await db.violations.create_index("severity")
    await db.violations.create_index("created_at")
    
    print("Database indexes created successfully")
