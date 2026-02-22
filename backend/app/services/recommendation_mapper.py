"""
Recommendation mapper service - converts dataset recommendations to executable rules
"""
from typing import Dict, Any
from datetime import datetime


def map_recommendation_to_rule(recommendation: Dict[str, Any], company_id: str) -> Dict[str, Any]:
    """
    Maps a dataset recommendation to a MongoDB rule definition
    """
    control_id = recommendation["control_id"]
    threshold_params = recommendation.get("threshold_params", {})
    
    # Build MongoDB query based on control type
    query = build_query_for_control(control_id, threshold_params, company_id)
    
    now = datetime.utcnow()
    
    rule = {
        "company_id": company_id,
        "policy_id": None,  # Not from a policy PDF
        "name": recommendation["title"],
        "description": recommendation["description"],
        "collection": get_collection_for_control(control_id),
        "query": query,
        "severity": recommendation["risk_level"],
        "enabled": True,
        "tags": ["dataset-recommendation", control_id],
        "framework": "AML",
        "control_id": control_id,
        "explanation": recommendation["description"],
        "threshold_params": threshold_params,
        "created_at": now,
        "updated_at": now
    }
    
    return rule


def build_query_for_control(control_id: str, params: Dict[str, Any], company_id: str) -> Dict[str, Any]:
    """
    Builds MongoDB query based on control ID and parameters
    """
    base_query = {"company_id": company_id}
    
    if control_id == "CTR-01":
        # Large cash transactions
        return {
            **base_query,
            "transaction_type": params.get("transaction_type", "CASH"),
            "amount": {"$gte": params.get("amount_limit", 1000000)}
        }
    
    elif control_id == "STR-01":
        # Structuring detection - requires aggregation
        # For now, return a simple query; full implementation would use aggregation pipeline
        return {
            **base_query,
            "transaction_type": "CASH",
            "amount": {
                "$gte": params.get("min_amount", 900000),
                "$lt": params.get("max_amount", 1000000)
            }
        }
    
    elif control_id == "HR-01":
        # High-risk account monitoring
        return {
            **base_query,
            "risk_score": {"$gte": params.get("risk_score_threshold", 70)}
        }
    
    elif control_id == "SAN-01":
        # Sanctions screening
        sanctioned = params.get("sanctioned_countries", [])
        return {
            **base_query,
            "country": {"$in": sanctioned}
        }
    
    elif control_id == "VEL-01":
        # Velocity monitoring - requires aggregation
        return {
            **base_query,
            "transaction_type": {"$exists": True}
        }
    
    elif control_id == "RRT-01":
        # Round-trip detection
        return {
            **base_query,
            "amount": {"$gte": params.get("min_amount", 100000)}
        }
    
    elif control_id == "NW-01":
        # Night/weekend transactions
        return {
            **base_query,
            "amount": {"$gte": params.get("amount_limit", 500000)}
        }
    
    elif control_id == "CDD-01":
        # CDD refresh
        return {
            **base_query,
            "status": "ACTIVE"
        }
    
    elif control_id == "PAY-01":
        # Payroll anomalies
        return {
            **base_query,
            "salary_amount": {"$exists": True}
        }
    
    elif control_id == "GEO-01":
        # Geographic risk
        high_risk = params.get("high_risk_countries", [])
        return {
            **base_query,
            "country": {"$in": high_risk},
            "amount": {"$gte": params.get("amount_threshold", 100000)}
        }
    
    else:
        # Default query
        return base_query


def get_collection_for_control(control_id: str) -> str:
    """
    Returns the MongoDB collection name for a given control
    """
    collection_map = {
        "CTR-01": "transactions",
        "STR-01": "transactions",
        "HR-01": "accounts",
        "SAN-01": "accounts",
        "VEL-01": "transactions",
        "RRT-01": "transactions",
        "NW-01": "transactions",
        "CDD-01": "accounts",
        "PAY-01": "payroll",
        "GEO-01": "transactions"
    }
    
    return collection_map.get(control_id, "transactions")
