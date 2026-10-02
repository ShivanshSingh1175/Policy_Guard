"""
ML pipeline tests
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime

from app.ml.feature_engineering import TransactionFeatureEngineer
from app.ml.data_processing import TransactionDataProcessor
from app.ml.model import AnomalyDetectionModel


def test_transaction_feature_extraction():
    """Test basic transaction feature extraction"""
    transaction = {
        "amount": 5000.0,
        "timestamp": datetime(2024, 1, 15, 14, 30),
        "transaction_type": "WIRE",
        "channel": "ONLINE",
        "src_account": "ACC001",
        "dst_account": "ACC002"
    }
    
    features = TransactionFeatureEngineer.extract_transaction_features(transaction)
    
    assert "amount" in features
    assert features["amount"] == 5000.0
    assert "log_amount" in features
    assert features["is_wire"] == 1.0
    assert features["is_online"] == 1.0
    assert features["hour"] == 14.0


def test_feature_names_consistency():
    """Verify feature names are consistent"""
    feature_names = TransactionFeatureEngineer.get_feature_names()
    assert len(feature_names) == 25
    assert "amount" in feature_names
    assert "risk_score" not in feature_names  # Should only be features, not targets


def test_data_validation():
    """Test transaction data validation"""
    valid_transaction = {
        "amount": 1000.0,
        "timestamp": datetime.utcnow(),
        "status": "COMPLETED"
    }
    
    assert TransactionDataProcessor.validate_transaction(valid_transaction)
    
    invalid_transaction = {
        "amount": 1000.0
        # Missing required fields
    }
    
    assert not TransactionDataProcessor.validate_transaction(invalid_transaction)


def test_data_cleaning():
    """Test transaction cleaning"""
    good_transaction = {
        "amount": 1000.0,
        "timestamp": datetime.utcnow(),
        "status": "COMPLETED",
        "src_account": "ACC001"
    }
    
    cleaned = TransactionDataProcessor.clean_transaction(good_transaction)
    assert cleaned is not None
    
    bad_transaction = {
        "amount": -100.0,  # Negative amount
        "timestamp": datetime.utcnow(),
        "status": "COMPLETED"
    }
    
    cleaned_bad = TransactionDataProcessor.clean_transaction(bad_transaction)
    assert cleaned_bad is None


def test_model_training():
    """Test model training with synthetic data"""
    # Generate synthetic feature data
    np.random.seed(42)
    n_samples = 200
    n_features = 25
    
    data = np.random.randn(n_samples, n_features)
    feature_names = [f"feature_{i}" for i in range(n_features)]
    df = pd.DataFrame(data, columns=feature_names)
    
    model = AnomalyDetectionModel(contamination=0.1, n_estimators=50)
    model.fit(df, feature_names)
    
    assert model.is_trained
    assert len(model.feature_names) == n_features
    assert "trained_at" in model.training_stats


def test_model_prediction():
    """Test model prediction"""
    np.random.seed(42)
    n_samples = 200
    n_features = 25
    
    data = np.random.randn(n_samples, n_features)
    feature_names = [f"feature_{i}" for i in range(n_features)]
    df = pd.DataFrame(data, columns=feature_names)
    
    model = AnomalyDetectionModel(contamination=0.1)
    model.fit(df, feature_names)
    
    # Predict on same data
    risk_scores = model.predict_risk_score(df.head(10))
    
    assert len(risk_scores) == 10
    assert all(0 <= score <= 100 for score in risk_scores)


def test_model_save_load(tmp_path):
    """Test model persistence"""
    np.random.seed(42)
    n_samples = 100
    n_features = 10
    
    data = np.random.randn(n_samples, n_features)
    feature_names = [f"feature_{i}" for i in range(n_features)]
    df = pd.DataFrame(data, columns=feature_names)
    
    model = AnomalyDetectionModel()
    model.fit(df, feature_names)
    
    # Save
    model_path = tmp_path / "test_model.joblib"
    model.save(str(model_path))
    
    # Load
    loaded_model = AnomalyDetectionModel.load(str(model_path))
    
    assert loaded_model.is_trained
    assert loaded_model.feature_names == feature_names
    
    # Verify predictions match
    original_pred = model.predict_risk_score(df.head(5))
    loaded_pred = loaded_model.predict_risk_score(df.head(5))
    
    np.testing.assert_array_almost_equal(original_pred, loaded_pred)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
