"""
Feature engineering for transaction anomaly detection
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
import pandas as pd
import numpy as np


class TransactionFeatureEngineer:
    """Extract behavioral features from transaction data"""
    
    @staticmethod
    def extract_transaction_features(transaction: Dict[str, Any]) -> Dict[str, float]:
        """Extract basic transaction-level features"""
        features = {}
        
        # Amount features
        features['amount'] = float(transaction.get('amount', 0))
        features['log_amount'] = np.log1p(features['amount'])
        
        # Round amount indicator
        features['is_round_amount'] = 1.0 if features['amount'] % 1000 == 0 else 0.0
        
        # Near threshold (just below 10k)
        features['near_threshold'] = 1.0 if 9000 <= features['amount'] < 10000 else 0.0
        
        # Temporal features
        timestamp = transaction.get('timestamp')
        if isinstance(timestamp, datetime):
            features['hour'] = float(timestamp.hour)
            features['day_of_week'] = float(timestamp.weekday())
            features['is_weekend'] = 1.0 if timestamp.weekday() >= 5 else 0.0
            features['is_night'] = 1.0 if timestamp.hour < 6 or timestamp.hour > 22 else 0.0
        else:
            features['hour'] = 12.0
            features['day_of_week'] = 2.0
            features['is_weekend'] = 0.0
            features['is_night'] = 0.0
        
        # Transaction type encoding
        tx_type = transaction.get('transaction_type', 'TRANSFER').upper()
        features['is_cash'] = 1.0 if tx_type == 'CASH' else 0.0
        features['is_wire'] = 1.0 if tx_type == 'WIRE' else 0.0
        features['is_ach'] = 1.0 if tx_type == 'ACH' else 0.0
        
        # Channel encoding
        channel = transaction.get('channel', 'ONLINE').upper()
        features['is_online'] = 1.0 if channel == 'ONLINE' else 0.0
        features['is_branch'] = 1.0 if channel == 'BRANCH' else 0.0
        features['is_atm'] = 1.0 if channel == 'ATM' else 0.0
        
        return features
    
    @staticmethod
    async def extract_velocity_features(
        db,
        transaction: Dict[str, Any],
        company_id: str
    ) -> Dict[str, float]:
        """Extract velocity and behavioral features requiring historical data"""
        features = {}
        
        src_account = transaction.get('src_account')
        timestamp = transaction.get('timestamp', datetime.utcnow())
        
        if not src_account:
            # Return default features if no account
            features.update({
                'tx_count_1h': 0.0,
                'tx_count_24h': 0.0,
                'tx_count_7d': 0.0,
                'amount_sum_24h': 0.0,
                'amount_avg_7d': 0.0,
                'amount_std_7d': 0.0,
                'unique_dst_24h': 0.0,
                'unique_dst_7d': 0.0,
                'amount_percentile': 50.0,
                'deviation_from_avg': 0.0
            })
            return features
        
        # Query historical transactions
        time_1h = timestamp - timedelta(hours=1)
        time_24h = timestamp - timedelta(hours=24)
        time_7d = timestamp - timedelta(days=7)
        
        # Transaction counts
        tx_1h = await db.transactions.count_documents({
            'company_id': company_id,
            'src_account': src_account,
            'timestamp': {'$gte': time_1h, '$lt': timestamp}
        })
        
        tx_24h = await db.transactions.count_documents({
            'company_id': company_id,
            'src_account': src_account,
            'timestamp': {'$gte': time_24h, '$lt': timestamp}
        })
        
        tx_7d_cursor = db.transactions.find({
            'company_id': company_id,
            'src_account': src_account,
            'timestamp': {'$gte': time_7d, '$lt': timestamp}
        })
        tx_7d_list = await tx_7d_cursor.to_list(length=None)
        
        features['tx_count_1h'] = float(tx_1h)
        features['tx_count_24h'] = float(tx_24h)
        features['tx_count_7d'] = float(len(tx_7d_list))
        
        # Amount statistics
        if tx_7d_list:
            amounts = [float(tx.get('amount', 0)) for tx in tx_7d_list]
            features['amount_avg_7d'] = float(np.mean(amounts))
            features['amount_std_7d'] = float(np.std(amounts))
            
            # Calculate percentile of current amount
            current_amount = float(transaction.get('amount', 0))
            if len(amounts) > 0:
                features['amount_percentile'] = float(
                    (sum(1 for a in amounts if a <= current_amount) / len(amounts)) * 100
                )
                features['deviation_from_avg'] = (
                    (current_amount - features['amount_avg_7d']) / 
                    (features['amount_std_7d'] + 1e-6)
                )
            else:
                features['amount_percentile'] = 50.0
                features['deviation_from_avg'] = 0.0
        else:
            features['amount_avg_7d'] = 0.0
            features['amount_std_7d'] = 0.0
            features['amount_percentile'] = 50.0
            features['deviation_from_avg'] = 0.0
        
        # Amount sum 24h
        tx_24h_cursor = db.transactions.find({
            'company_id': company_id,
            'src_account': src_account,
            'timestamp': {'$gte': time_24h, '$lt': timestamp}
        })
        tx_24h_list = await tx_24h_cursor.to_list(length=None)
        features['amount_sum_24h'] = float(sum(tx.get('amount', 0) for tx in tx_24h_list))
        
        # Unique destinations
        dst_24h = set(tx.get('dst_account') for tx in tx_24h_list if tx.get('dst_account'))
        dst_7d = set(tx.get('dst_account') for tx in tx_7d_list if tx.get('dst_account'))
        
        features['unique_dst_24h'] = float(len(dst_24h))
        features['unique_dst_7d'] = float(len(dst_7d))
        
        # New beneficiary indicator
        current_dst = transaction.get('dst_account')
        if current_dst and tx_7d_list:
            historical_dsts = set(tx.get('dst_account') for tx in tx_7d_list)
            features['is_new_beneficiary'] = 0.0 if current_dst in historical_dsts else 1.0
        else:
            features['is_new_beneficiary'] = 0.0
        
        return features
    
    @staticmethod
    async def extract_all_features(
        db,
        transaction: Dict[str, Any],
        company_id: str
    ) -> Dict[str, float]:
        """Extract all features for a transaction"""
        basic_features = TransactionFeatureEngineer.extract_transaction_features(transaction)
        velocity_features = await TransactionFeatureEngineer.extract_velocity_features(
            db, transaction, company_id
        )
        
        # Combine all features
        all_features = {**basic_features, **velocity_features}
        return all_features
    
    @staticmethod
    def get_feature_names() -> List[str]:
        """Return ordered list of feature names"""
        return [
            # Transaction features
            'amount',
            'log_amount',
            'is_round_amount',
            'near_threshold',
            'hour',
            'day_of_week',
            'is_weekend',
            'is_night',
            'is_cash',
            'is_wire',
            'is_ach',
            'is_online',
            'is_branch',
            'is_atm',
            # Velocity features
            'tx_count_1h',
            'tx_count_24h',
            'tx_count_7d',
            'amount_sum_24h',
            'amount_avg_7d',
            'amount_std_7d',
            'unique_dst_24h',
            'unique_dst_7d',
            'amount_percentile',
            'deviation_from_avg',
            'is_new_beneficiary'
        ]
