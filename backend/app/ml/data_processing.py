"""
Data loading and preprocessing for ML pipeline
"""
from typing import Dict, Any, List, Tuple, Optional
import pandas as pd
import numpy as np
from datetime import datetime


class TransactionDataProcessor:
    """Process transaction data for ML training and inference"""
    
    @staticmethod
    def validate_transaction(transaction: Dict[str, Any]) -> bool:
        """Validate transaction has required fields"""
        required_fields = ['amount', 'timestamp', 'status']
        return all(field in transaction for field in required_fields)
    
    @staticmethod
    def clean_transaction(transaction: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Clean and validate transaction data"""
        # Check required fields
        if not TransactionDataProcessor.validate_transaction(transaction):
            return None
        
        # Validate amount
        amount = transaction.get('amount')
        if not isinstance(amount, (int, float)) or amount < 0:
            return None
        
        # Validate timestamp
        timestamp = transaction.get('timestamp')
        if not isinstance(timestamp, datetime):
            return None
        
        # Only process completed transactions
        if transaction.get('status') != 'COMPLETED':
            return None
        
        return transaction
    
    @staticmethod
    async def load_transactions(
        db,
        company_id: str,
        limit: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Load transactions from MongoDB with filters"""
        query = {'company_id': company_id, 'status': 'COMPLETED'}
        
        if start_date or end_date:
            timestamp_filter = {}
            if start_date:
                timestamp_filter['$gte'] = start_date
            if end_date:
                timestamp_filter['$lte'] = end_date
            query['timestamp'] = timestamp_filter
        
        cursor = db.transactions.find(query).sort('timestamp', 1)
        
        if limit:
            cursor = cursor.limit(limit)
        
        transactions = await cursor.to_list(length=None)
        
        # Clean transactions
        cleaned = []
        for tx in transactions:
            clean_tx = TransactionDataProcessor.clean_transaction(tx)
            if clean_tx:
                cleaned.append(clean_tx)
        
        return cleaned
    
    @staticmethod
    def features_to_dataframe(
        features_list: List[Dict[str, float]],
        feature_names: List[str]
    ) -> pd.DataFrame:
        """Convert list of feature dicts to DataFrame"""
        # Ensure all features present
        rows = []
        for features in features_list:
            row = []
            for name in feature_names:
                row.append(features.get(name, 0.0))
            rows.append(row)
        
        df = pd.DataFrame(rows, columns=feature_names)
        return df
    
    @staticmethod
    def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in features"""
        # Fill numeric columns with median
        for col in df.columns:
            if df[col].dtype in [np.float64, np.int64]:
                if df[col].isna().any():
                    median_val = df[col].median()
                    df[col].fillna(median_val, inplace=True)
        
        return df
    
    @staticmethod
    def remove_outliers(
        df: pd.DataFrame,
        columns: Optional[List[str]] = None,
        threshold: float = 3.0
    ) -> pd.DataFrame:
        """Remove extreme outliers using z-score method"""
        if columns is None:
            columns = ['amount', 'log_amount']
        
        mask = np.ones(len(df), dtype=bool)
        
        for col in columns:
            if col in df.columns:
                z_scores = np.abs((df[col] - df[col].mean()) / (df[col].std() + 1e-6))
                mask &= z_scores < threshold
        
        return df[mask].copy()
    
    @staticmethod
    def split_temporal(
        df: pd.DataFrame,
        test_size: float = 0.2
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split data temporally (time-aware split)"""
        split_idx = int(len(df) * (1 - test_size))
        train_df = df.iloc[:split_idx].copy()
        test_df = df.iloc[split_idx:].copy()
        return train_df, test_df
