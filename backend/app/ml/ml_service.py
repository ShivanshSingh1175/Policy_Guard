"""
ML service for model management, training, and prediction
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path
import pandas as pd

from app.ml.model import AnomalyDetectionModel
from app.ml.feature_engineering import TransactionFeatureEngineer
from app.ml.data_processing import TransactionDataProcessor


class MLService:
    """Centralized ML service for anomaly detection"""
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.active_models: Dict[str, AnomalyDetectionModel] = {}
    
    async def train_model(
        self,
        db,
        company_id: str,
        model_version: str,
        contamination: float = 0.05,
        n_estimators: int = 100,
        min_samples: int = 100
    ) -> Dict[str, Any]:
        """Train anomaly detection model for company"""
        
        # Load transactions
        transactions = await TransactionDataProcessor.load_transactions(
            db, company_id, limit=10000
        )
        
        if len(transactions) < min_samples:
            return {
                'success': False,
                'error': f'Insufficient data: {len(transactions)} transactions (minimum {min_samples} required)'
            }
        
        # Extract features
        feature_engineer = TransactionFeatureEngineer()
        features_list = []
        
        for tx in transactions:
            features = await feature_engineer.extract_all_features(db, tx, company_id)
            features_list.append(features)
        
        # Convert to DataFrame
        feature_names = feature_engineer.get_feature_names()
        df = TransactionDataProcessor.features_to_dataframe(features_list, feature_names)
        
        # Handle missing values
        df = TransactionDataProcessor.handle_missing_values(df)
        
        # Split temporal
        train_df, test_df = TransactionDataProcessor.split_temporal(df, test_size=0.2)
        
        # Train model
        model = AnomalyDetectionModel(
            contamination=contamination,
            n_estimators=n_estimators
        )
        
        model.fit(train_df, feature_names)
        
        # Evaluate
        train_metrics = model.evaluate(train_df)
        test_metrics = model.evaluate(test_df)
        
        # Save model
        model_path = self.models_dir / f"{company_id}_{model_version}.joblib"
        metadata = {
            'company_id': company_id,
            'model_version': model_version,
            'trained_at': datetime.utcnow().isoformat(),
            'n_transactions': len(transactions),
            'n_train': len(train_df),
            'n_test': len(test_df)
        }
        
        model.save(str(model_path), metadata)
        
        # Store in MongoDB
        model_doc = {
            'company_id': company_id,
            'model_version': model_version,
            'algorithm': 'IsolationForest',
            'hyperparameters': {
                'contamination': contamination,
                'n_estimators': n_estimators
            },
            'feature_names': feature_names,
            'training_stats': model.training_stats,
            'train_metrics': train_metrics,
            'test_metrics': test_metrics,
            'metadata': metadata,
            'model_path': str(model_path),
            'status': 'trained',
            'created_at': datetime.utcnow()
        }
        
        result = await db.ml_models.insert_one(model_doc)
        
        return {
            'success': True,
            'model_id': str(result.inserted_id),
            'model_version': model_version,
            'train_metrics': train_metrics,
            'test_metrics': test_metrics,
            'n_transactions': len(transactions),
            'n_features': len(feature_names)
        }
    
    async def load_model(
        self,
        db,
        company_id: str,
        model_version: Optional[str] = None
    ) -> Optional[AnomalyDetectionModel]:
        """Load model for company"""
        
        # Check if already loaded
        cache_key = f"{company_id}_{model_version or 'active'}"
        if cache_key in self.active_models:
            return self.active_models[cache_key]
        
        # Find model in database
        query = {'company_id': company_id, 'status': 'trained'}
        if model_version:
            query['model_version'] = model_version
        
        model_doc = await db.ml_models.find_one(
            query,
            sort=[('created_at', -1)]
        )
        
        if not model_doc:
            return None
        
        # Load model file
        model_path = model_doc.get('model_path')
        if not model_path or not Path(model_path).exists():
            return None
        
        try:
            model = AnomalyDetectionModel.load(model_path)
            self.active_models[cache_key] = model
            return model
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    
    async def predict(
        self,
        db,
        transaction: Dict[str, Any],
        company_id: str,
        model_version: Optional[str] = None
    ) -> Dict[str, Any]:
        """Predict anomaly score for single transaction"""
        
        # Load model
        model = await self.load_model(db, company_id, model_version)
        
        if not model:
            return {
                'success': False,
                'error': 'No trained model available',
                'risk_score': 0.0,
                'prediction': 'UNKNOWN'
            }
        
        # Extract features
        feature_engineer = TransactionFeatureEngineer()
        features = await feature_engineer.extract_all_features(db, transaction, company_id)
        
        # Convert to DataFrame
        feature_names = model.feature_names
        df = TransactionDataProcessor.features_to_dataframe([features], feature_names)
        
        # Predict
        risk_score = model.predict_risk_score(df)[0]
        label = model.predict_labels(df)[0]
        
        # Determine prediction category
        if risk_score >= 80:
            prediction = 'CRITICAL'
        elif risk_score >= 60:
            prediction = 'SUSPICIOUS'
        elif risk_score >= 40:
            prediction = 'ELEVATED'
        else:
            prediction = 'NORMAL'
        
        # Generate reasons
        reasons = []
        if features.get('deviation_from_avg', 0) > 2:
            reasons.append('Amount significantly above account baseline')
        if features.get('tx_count_24h', 0) >= 5:
            reasons.append('High transaction frequency')
        if features.get('is_new_beneficiary', 0) == 1:
            reasons.append('New beneficiary account')
        if features.get('near_threshold', 0) == 1:
            reasons.append('Amount near reporting threshold')
        if features.get('is_night', 0) == 1:
            reasons.append('Transaction during unusual hours')
        if features.get('is_round_amount', 0) == 1:
            reasons.append('Round amount transaction')
        
        if not reasons:
            reasons.append('Anomalous transaction pattern detected')
        
        return {
            'success': True,
            'risk_score': float(risk_score),
            'prediction': prediction,
            'is_anomaly': label == -1,
            'reasons': reasons,
            'model_version': model_version or 'latest'
        }
    
    async def get_model_info(
        self,
        db,
        company_id: str,
        model_version: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get model metadata"""
        query = {'company_id': company_id}
        if model_version:
            query['model_version'] = model_version
        
        model_doc = await db.ml_models.find_one(
            query,
            sort=[('created_at', -1)]
        )
        
        if not model_doc:
            return None
        
        model_doc['_id'] = str(model_doc['_id'])
        return model_doc
