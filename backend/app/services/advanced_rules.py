"""
Advanced AML Detection Rules using MongoDB Aggregation Pipelines
Implements sophisticated pattern detection for money laundering activities
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId


class AdvancedRuleEngine:
    """
    Advanced rule engine for complex AML pattern detection
    Uses MongoDB aggregation pipelines for sophisticated analysis
    """
    
    @staticmethod
    async def detect_structuring_pattern(db, company_id: str, hours_window: int = 24) -> List[Dict[str, Any]]:
        """
        Detect structuring: Multiple transactions below $10k threshold within time window
        
        Pattern: 3+ transactions between $9,000-$9,999 from same account within 24 hours
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_window)
        
        pipeline = [
            {
                "$match": {
                    "company_id": company_id,
                    "amount": {"$gte": 9000, "$lt": 10000},
                    "timestamp": {"$gte": cutoff_time},
                    "status": "COMPLETED"
                }
            },
            {
                "$group": {
                    "_id": "$src_account",
                    "transaction_count": {"$sum": 1},
                    "total_amount": {"$sum": "$amount"},
                    "transactions": {
                        "$push": {
                            "transaction_id": "$transaction_id",
                            "amount": "$amount",
                            "timestamp": "$timestamp",
                            "transaction_type": "$transaction_type"
                        }
                    },
                    "first_transaction": {"$min": "$timestamp"},
                    "last_transaction": {"$max": "$timestamp"}
                }
            },
            {
                "$match": {
                    "transaction_count": {"$gte": 3}
                }
            },
            {
                "$project": {
                    "account_id": "$_id",
                    "transaction_count": 1,
                    "total_amount": 1,
                    "transactions": 1,
                    "time_span_hours": {
                        "$divide": [
                            {"$subtract": ["$last_transaction", "$first_transaction"]},
                            3600000  # Convert ms to hours
                        ]
                    }
                }
            }
        ]
        
        results = await db.transactions.aggregate(pipeline).to_list(length=None)
        return results
    
    @staticmethod
    async def detect_rapid_transfers(db, company_id: str, hours_window: int = 24, min_transfers: int = 5) -> List[Dict[str, Any]]:
        """
        Detect rapid transfers to same beneficiary
        
        Pattern: 5+ transfers to same destination account within 24 hours
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_window)
        
        pipeline = [
            {
                "$match": {
                    "company_id": company_id,
                    "timestamp": {"$gte": cutoff_time},
                    "transaction_type": {"$in": ["WIRE", "ACH"]},
                    "status": "COMPLETED"
                }
            },
            {
                "$group": {
                    "_id": {
                        "src_account": "$src_account",
                        "dst_account": "$dst_account"
                    },
                    "transfer_count": {"$sum": 1},
                    "total_amount": {"$sum": "$amount"},
                    "avg_amount": {"$avg": "$amount"},
                    "transfers": {
                        "$push": {
                            "transaction_id": "$transaction_id",
                            "amount": "$amount",
                            "timestamp": "$timestamp"
                        }
                    }
                }
            },
            {
                "$match": {
                    "transfer_count": {"$gte": min_transfers}
                }
            },
            {
                "$project": {
                    "src_account": "$_id.src_account",
                    "dst_account": "$_id.dst_account",
                    "transfer_count": 1,
                    "total_amount": 1,
                    "avg_amount": 1,
                    "transfers": 1
                }
            }
        ]
        
        results = await db.transactions.aggregate(pipeline).to_list(length=None)
        return results
    
    @staticmethod
    async def detect_high_risk_accounts(db, company_id: str, violation_threshold: int = 5) -> List[Dict[str, Any]]:
        """
        Identify accounts with multiple violations indicating high-risk activity
        
        Pattern: Accounts with 5+ violations in last 30 days
        """
        cutoff_time = datetime.utcnow() - timedelta(days=30)
        
        pipeline = [
            {
                "$match": {
                    "company_id": company_id,
                    "created_at": {"$gte": cutoff_time},
                    "status": {"$in": ["OPEN", "CONFIRMED"]}
                }
            },
            {
                "$addFields": {
                    "account_id": {
                        "$ifNull": [
                            "$document_data.account_id",
                            {"$ifNull": ["$document_data.src_account", "$document_data.dst_account"]}
                        ]
                    }
                }
            },
            {
                "$match": {
                    "account_id": {"$ne": None}
                }
            },
            {
                "$group": {
                    "_id": "$account_id",
                    "violation_count": {"$sum": 1},
                    "critical_count": {
                        "$sum": {"$cond": [{"$eq": ["$severity", "CRITICAL"]}, 1, 0]}
                    },
                    "high_count": {
                        "$sum": {"$cond": [{"$eq": ["$severity", "HIGH"]}, 1, 0]}
                    },
                    "violations": {
                        "$push": {
                            "violation_id": {"$toString": "$_id"},
                            "rule_name": "$rule_name",
                            "severity": "$severity",
                            "created_at": "$created_at"
                        }
                    }
                }
            },
            {
                "$match": {
                    "violation_count": {"$gte": violation_threshold}
                }
            },
            {
                "$project": {
                    "account_id": "$_id",
                    "violation_count": 1,
                    "critical_count": 1,
                    "high_count": 1,
                    "risk_score": {
                        "$add": [
                            {"$multiply": ["$critical_count", 10]},
                            {"$multiply": ["$high_count", 5]},
                            "$violation_count"
                        ]
                    },
                    "violations": 1
                }
            },
            {
                "$sort": {"risk_score": -1}
            }
        ]
        
        results = await db.violations.aggregate(pipeline).to_list(length=None)
        return results
    
    @staticmethod
    async def detect_unusual_frequency(db, company_id: str, days_window: int = 7) -> List[Dict[str, Any]]:
        """
        Detect accounts with unusual transaction frequency
        
        Pattern: Accounts with 3x more transactions than their historical average
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days_window)
        historical_cutoff = cutoff_time - timedelta(days=days_window * 4)  # 4x window for baseline
        
        pipeline = [
            {
                "$match": {
                    "company_id": company_id,
                    "timestamp": {"$gte": historical_cutoff},
                    "status": "COMPLETED"
                }
            },
            {
                "$group": {
                    "_id": "$src_account",
                    "recent_count": {
                        "$sum": {"$cond": [{"$gte": ["$timestamp", cutoff_time]}, 1, 0]}
                    },
                    "historical_count": {
                        "$sum": {"$cond": [{"$lt": ["$timestamp", cutoff_time]}, 1, 0]}
                    },
                    "recent_amount": {
                        "$sum": {"$cond": [{"$gte": ["$timestamp", cutoff_time]}, "$amount", 0]}
                    }
                }
            },
            {
                "$addFields": {
                    "historical_avg_per_week": {
                        "$divide": ["$historical_count", 4]
                    }
                }
            },
            {
                "$match": {
                    "$expr": {
                        "$and": [
                            {"$gt": ["$historical_avg_per_week", 0]},
                            {"$gte": ["$recent_count", {"$multiply": ["$historical_avg_per_week", 3]}]}
                        ]
                    }
                }
            },
            {
                "$project": {
                    "account_id": "$_id",
                    "recent_transaction_count": "$recent_count",
                    "historical_avg_per_week": 1,
                    "recent_total_amount": "$recent_amount",
                    "frequency_multiplier": {
                        "$divide": ["$recent_count", "$historical_avg_per_week"]
                    }
                }
            },
            {
                "$sort": {"frequency_multiplier": -1}
            }
        ]
        
        results = await db.transactions.aggregate(pipeline).to_list(length=None)
        return results
    
    @staticmethod
    async def detect_daily_structuring(db, company_id: str, days_window: int = 30) -> List[Dict[str, Any]]:
        """
        Detect daily structuring: Multiple transactions on same day totaling < $10k
        
        Pattern: 3+ transactions from same account on same day, total < $10,000
        This is a sophisticated structuring technique to avoid daily reporting thresholds
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days_window)
        
        pipeline = [
            {
                "$match": {
                    "company_id": company_id,
                    "timestamp": {"$gte": cutoff_time},
                    "status": "COMPLETED"
                }
            },
            {
                "$group": {
                    "_id": {
                        "account_id": "$src_account",
                        "day": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$timestamp"
                            }
                        }
                    },
                    "count": {"$sum": 1},
                    "total": {"$sum": "$amount"},
                    "transactions": {
                        "$push": {
                            "transaction_id": "$transaction_id",
                            "amount": "$amount",
                            "timestamp": "$timestamp",
                            "transaction_type": "$transaction_type"
                        }
                    }
                }
            },
            {
                "$match": {
                    "count": {"$gte": 3},
                    "total": {"$lt": 10000}
                }
            },
            {
                "$project": {
                    "account_id": "$_id.account_id",
                    "day": "$_id.day",
                    "transaction_count": "$count",
                    "daily_total": "$total",
                    "transactions": 1
                }
            },
            {
                "$sort": {"daily_total": -1}
            }
        ]
        
        results = await db.transactions.aggregate(pipeline).to_list(length=None)
        return results
    
    @staticmethod
    async def detect_round_amount_pattern(db, company_id: str, days_window: int = 30) -> List[Dict[str, Any]]:
        """
        Detect suspicious round-amount transactions
        
        Pattern: Multiple transactions with round amounts (e.g., $5000, $10000) which may indicate layering
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days_window)
        
        pipeline = [
            {
                "$match": {
                    "company_id": company_id,
                    "timestamp": {"$gte": cutoff_time},
                    "status": "COMPLETED"
                }
            },
            {
                "$addFields": {
                    "is_round_amount": {
                        "$eq": [{"$mod": ["$amount", 1000]}, 0]
                    }
                }
            },
            {
                "$match": {
                    "is_round_amount": True,
                    "amount": {"$gte": 5000}
                }
            },
            {
                "$group": {
                    "_id": "$src_account",
                    "round_transaction_count": {"$sum": 1},
                    "total_round_amount": {"$sum": "$amount"},
                    "transactions": {
                        "$push": {
                            "transaction_id": "$transaction_id",
                            "amount": "$amount",
                            "timestamp": "$timestamp",
                            "transaction_type": "$transaction_type"
                        }
                    }
                }
            },
            {
                "$match": {
                    "round_transaction_count": {"$gte": 3}
                }
            },
            {
                "$project": {
                    "account_id": "$_id",
                    "round_transaction_count": 1,
                    "total_round_amount": 1,
                    "transactions": 1
                }
            }
        ]
        
        results = await db.transactions.aggregate(pipeline).to_list(length=None)
        return results


async def create_violations_from_pattern(
    db,
    company_id: str,
    scan_run_id: str,
    rule_id: str,
    rule_name: str,
    pattern_results: List[Dict[str, Any]],
    severity: str,
    explanation_template: str
) -> int:
    """
    Create violation records from pattern detection results
    
    Returns: Number of violations created
    """
    violations = []
    now = datetime.utcnow()
    
    for result in pattern_results:
        # Build explanation with specific details
        explanation = explanation_template.format(**result)
        
        violation_doc = {
            "company_id": company_id,
            "scan_run_id": scan_run_id,
            "rule_id": rule_id,
            "rule_name": rule_name,
            "collection": "transactions",  # Most patterns are transaction-based
            "document_id": str(result.get("_id", "pattern_detection")),
            "document_data": result,
            "severity": severity,
            "status": "OPEN",
            "explanation": explanation,
            "reviewer_note": None,
            "reviewed_by": None,
            "reviewed_at": None,
            "created_at": now,
            "updated_at": now
        }
        
        violations.append(violation_doc)
    
    if violations:
        await db.violations.insert_many(violations)
    
    return len(violations)
