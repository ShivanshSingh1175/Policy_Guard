"""
ML model training, evaluation, and inference
"""
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime
from pathlib import Path


class AnomalyDetectionModel:
    """Isolation Forest-based anomaly detection for transactions"""
    
    def __init__(
        self,
        contamination: float = 0.05,
        n_estimators: int = 100,
        random_state: int = 42
    ):
        """Initialize model with hyperparameters"""
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.random_state = random_state
        
        self.model = IsolationForest(
            contamination=contamination,
            n_estimators=n_estimators,
            random_state=random_state,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        
        self.feature_names: List[str] = []
        self.is_trained = False
        self.training_stats: Dict[str, Any] = {}
    
    def fit(self, X: pd.DataFrame, feature_names: List[str]) -> None:
        """Train the model"""
        self.feature_names = feature_names
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        
        # Calculate training statistics
        scores = self.model.score_samples(X_scaled)
        self.training_stats = {
            'n_samples': len(X),
            'n_features': len(feature_names),
            'score_mean': float(np.mean(scores)),
            'score_std': float(np.std(scores)),
            'score_min': float(np.min(scores)),
            'score_max': float(np.max(scores)),
            'trained_at': datetime.utcnow().isoformat()
        }
        
        self.is_trained = True
    
    def predict_scores(self, X: pd.DataFrame) -> np.ndarray:
        """Get anomaly scores (lower = more anomalous)"""
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        X_scaled = self.scaler.transform(X)
        scores = self.model.score_samples(X_scaled)
        return scores
    
    def predict_labels(self, X: pd.DataFrame) -> np.ndarray:
        """Get anomaly labels (1 = normal, -1 = anomaly)"""
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        X_scaled = self.scaler.transform(X)
        labels = self.model.predict(X_scaled)
        return labels
    
    def predict_risk_score(self, X: pd.DataFrame) -> np.ndarray:
        """Convert anomaly scores to 0-100 risk scores"""
        raw_scores = self.predict_scores(X)
        
        # Normalize to 0-100 range based on training statistics
        min_score = self.training_stats['score_min']
        max_score = self.training_stats['score_max']
        
        # Invert: lower anomaly score = higher risk
        normalized = 100 * (1 - (raw_scores - min_score) / (max_score - min_score + 1e-6))
        normalized = np.clip(normalized, 0, 100)
        
        return normalized
    
    def evaluate(self, X: pd.DataFrame) -> Dict[str, Any]:
        """Evaluate model on dataset"""
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        scores = self.predict_scores(X)
        labels = self.predict_labels(X)
        risk_scores = self.predict_risk_score(X)
        
        anomaly_count = np.sum(labels == -1)
        anomaly_pct = (anomaly_count / len(X)) * 100
        
        return {
            'n_samples': len(X),
            'n_anomalies': int(anomaly_count),
            'anomaly_percentage': float(anomaly_pct),
            'score_mean': float(np.mean(scores)),
            'score_std': float(np.std(scores)),
            'risk_score_mean': float(np.mean(risk_scores)),
            'risk_score_std': float(np.std(risk_scores)),
            'risk_score_p95': float(np.percentile(risk_scores, 95)),
            'risk_score_p99': float(np.percentile(risk_scores, 99))
        }
    
    def save(self, model_path: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Save model, scaler, and metadata"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'training_stats': self.training_stats,
            'hyperparameters': {
                'contamination': self.contamination,
                'n_estimators': self.n_estimators,
                'random_state': self.random_state
            },
            'metadata': metadata or {}
        }
        
        # Ensure directory exists
        Path(model_path).parent.mkdir(parents=True, exist_ok=True)
        
        joblib.dump(model_data, model_path)
    
    @staticmethod
    def load(model_path: str) -> 'AnomalyDetectionModel':
        """Load trained model"""
        model_data = joblib.load(model_path)
        
        # Reconstruct model instance
        hyperparams = model_data['hyperparameters']
        instance = AnomalyDetectionModel(
            contamination=hyperparams['contamination'],
            n_estimators=hyperparams['n_estimators'],
            random_state=hyperparams['random_state']
        )
        
        instance.model = model_data['model']
        instance.scaler = model_data['scaler']
        instance.feature_names = model_data['feature_names']
        instance.training_stats = model_data['training_stats']
        instance.is_trained = True
        
        return instance
    
    def get_feature_importance(self, X: pd.DataFrame, n_samples: int = 100) -> Dict[str, float]:
        """Estimate feature importance by permutation"""
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        # Use subset for efficiency
        X_subset = X.sample(n=min(n_samples, len(X)), random_state=42)
        
        base_scores = self.predict_scores(X_subset)
        base_anomaly = np.mean(base_scores)
        
        importances = {}
        
        for feature in self.feature_names:
            # Permute feature
            X_permuted = X_subset.copy()
            X_permuted[feature] = np.random.permutation(X_permuted[feature].values)
            
            # Get new scores
            permuted_scores = self.predict_scores(X_permuted)
            permuted_anomaly = np.mean(permuted_scores)
            
            # Importance = change in anomaly detection
            importances[feature] = abs(permuted_anomaly - base_anomaly)
        
        # Normalize
        total = sum(importances.values())
        if total > 0:
            importances = {k: v / total for k, v in importances.items()}
        
        return dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
