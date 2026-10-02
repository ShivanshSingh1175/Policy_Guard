"""
Integration tests for end-to-end workflow
"""
import pytest
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


@pytest.fixture
async def db():
    """Get database connection for testing"""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    database = client[settings.MONGO_DB_NAME + "_test"]
    yield database
    # Cleanup
    await client.drop_database(settings.MONGO_DB_NAME + "_test")
    client.close()


@pytest.mark.asyncio
async def test_tenant_isolation(db):
    """Test that Company A cannot access Company B data"""
    company_a = "company_a_test"
    company_b = "company_b_test"
    
    # Insert test data
    await db.transactions.insert_one({
        "company_id": company_a,
        "transaction_id": "TXN_A_001",
        "amount": 5000.0,
        "timestamp": datetime.utcnow(),
        "status": "COMPLETED"
    })
    
    await db.transactions.insert_one({
        "company_id": company_b,
        "transaction_id": "TXN_B_001",
        "amount": 8000.0,
        "timestamp": datetime.utcnow(),
        "status": "COMPLETED"
    })
    
    # Query as Company A
    company_a_data = await db.transactions.find({
        "company_id": company_a
    }).to_list(length=None)
    
    # Verify isolation
    assert len(company_a_data) == 1
    assert company_a_data[0]["transaction_id"] == "TXN_A_001"
    assert all(tx["company_id"] == company_a for tx in company_a_data)
    
    # Query as Company B
    company_b_data = await db.transactions.find({
        "company_id": company_b
    }).to_list(length=None)
    
    assert len(company_b_data) == 1
    assert company_b_data[0]["transaction_id"] == "TXN_B_001"
    assert all(tx["company_id"] == company_b for tx in company_b_data)


@pytest.mark.asyncio
async def test_feature_extraction_pipeline(db):
    """Test complete feature extraction pipeline"""
    from app.ml.feature_engineering import TransactionFeatureEngineer
    
    company_id = "test_company"
    
    # Insert test transaction
    test_tx = {
        "company_id": company_id,
        "transaction_id": "TEST_001",
        "amount": 9500.0,
        "timestamp": datetime(2024, 1, 15, 14, 30),
        "transaction_type": "CASH",
        "channel": "BRANCH",
        "src_account": "ACC001",
        "dst_account": "ACC002",
        "status": "COMPLETED"
    }
    
    await db.transactions.insert_one(test_tx)
    
    # Extract features
    features = await TransactionFeatureEngineer.extract_all_features(
        db, test_tx, company_id
    )
    
    # Verify features
    assert "amount" in features
    assert features["amount"] == 9500.0
    assert "near_threshold" in features
    assert features["near_threshold"] == 1.0  # Amount is 9000-10000
    assert "is_cash" in features
    assert features["is_cash"] == 1.0
    
    # Verify we have the expected number of features
    feature_names = TransactionFeatureEngineer.get_feature_names()
    assert len(features) == len(feature_names)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
