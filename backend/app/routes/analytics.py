"""
Analytics and reporting endpoints
"""
from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId

from app.db import get_database
from app.routes.auth import get_current_user, TokenData

router = APIRouter()


@router.get("/control-health")
async def get_control_health(current_user: TokenData = Depends(get_current_user)):
    """
    Get control health metrics per rule
    Returns rule performance and violation statistics
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Get all rules for the company
    rules = await db.rules.find({"company_id": company_id}).to_list(length=1000)
    
    control_health = []
    
    for rule in rules:
        rule_id = str(rule["_id"])
        
        # Count total scans that checked this rule
        total_scans = await db.scan_runs.count_documents({
            "company_id": company_id,
            "status": "COMPLETED"
        })
        
        # Count violations for this rule
        total_violations = await db.violations.count_documents({
            "company_id": company_id,
            "rule_id": rule_id
        })
        
        # Get last violation date
        last_violation = await db.violations.find_one(
            {"company_id": company_id, "rule_id": rule_id},
            sort=[("created_at", -1)]
        )
        
        last_seen_at = last_violation["created_at"].isoformat() if last_violation else None
        
        # Calculate average violations per scan
        avg_violations = round(total_violations / total_scans, 2) if total_scans > 0 else 0
        
        control_health.append({
            "rule_id": rule_id,
            "rule_name": rule.get("name", "Unknown"),
            "framework": rule.get("framework", "AML"),
            "control_id": rule.get("control_id"),
            "severity": rule.get("severity", "MEDIUM"),
            "total_scans": total_scans,
            "total_violations": total_violations,
            "last_seen_at": last_seen_at,
            "average_violations_per_scan": avg_violations,
            "enabled": rule.get("enabled", True)
        })
    
    # Sort by total violations descending
    control_health.sort(key=lambda x: x["total_violations"], reverse=True)
    
    return control_health


@router.get("/top-risks")
async def get_top_risks(current_user: TokenData = Depends(get_current_user)):
    """
    Get top risk accounts and rules
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Top 5 rules by violation count
    top_rules_pipeline = [
        {"$match": {"company_id": company_id}},
        {"$group": {
            "_id": "$rule_id",
            "rule_name": {"$first": "$rule_name"},
            "violation_count": {"$sum": 1},
            "critical_count": {
                "$sum": {"$cond": [{"$eq": ["$severity", "CRITICAL"]}, 1, 0]}
            },
            "high_count": {
                "$sum": {"$cond": [{"$eq": ["$severity", "HIGH"]}, 1, 0]}
            }
        }},
        {"$sort": {"violation_count": -1}},
        {"$limit": 5}
    ]
    
    top_rules = await db.violations.aggregate(top_rules_pipeline).to_list(length=5)
    
    # Format top rules
    top_rules_formatted = [
        {
            "rule_id": str(rule["_id"]),
            "rule_name": rule["rule_name"],
            "violation_count": rule["violation_count"],
            "critical_count": rule["critical_count"],
            "high_count": rule["high_count"]
        }
        for rule in top_rules
    ]
    
    # Top 5 accounts by violation count
    top_accounts_pipeline = [
        {"$match": {"company_id": company_id, "collection": "accounts"}},
        {"$group": {
            "_id": "$document_id",
            "violation_count": {"$sum": 1},
            "critical_count": {
                "$sum": {"$cond": [{"$eq": ["$severity", "CRITICAL"]}, 1, 0]}
            },
            "high_count": {
                "$sum": {"$cond": [{"$eq": ["$severity", "HIGH"]}, 1, 0]}
            },
            "account_data": {"$first": "$document_data"}
        }},
        {"$sort": {"violation_count": -1}},
        {"$limit": 5}
    ]
    
    top_accounts = await db.violations.aggregate(top_accounts_pipeline).to_list(length=5)
    
    # Format top accounts
    top_accounts_formatted = [
        {
            "account_id": str(acc["_id"]),
            "account_name": acc["account_data"].get("account_name", "Unknown"),
            "violation_count": acc["violation_count"],
            "critical_count": acc["critical_count"],
            "high_count": acc["high_count"],
            "risk_score": (acc["critical_count"] * 10 + acc["high_count"] * 5)
        }
        for acc in top_accounts
    ]
    
    return {
        "top_rules": top_rules_formatted,
        "top_accounts": top_accounts_formatted
    }


@router.get("/framework-coverage")
async def get_framework_coverage(current_user: TokenData = Depends(get_current_user)):
    """
    Get coverage statistics per framework and control
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Count rules per framework
    framework_pipeline = [
        {"$match": {"company_id": company_id}},
        {"$group": {
            "_id": "$framework",
            "rule_count": {"$sum": 1},
            "enabled_count": {
                "$sum": {"$cond": ["$enabled", 1, 0]}
            }
        }},
        {"$sort": {"rule_count": -1}}
    ]
    
    frameworks = await db.rules.aggregate(framework_pipeline).to_list(length=100)
    
    # Count rules per control_id
    control_pipeline = [
        {"$match": {"company_id": company_id, "control_id": {"$ne": None}}},
        {"$group": {
            "_id": {
                "framework": "$framework",
                "control_id": "$control_id"
            },
            "rule_count": {"$sum": 1},
            "enabled_count": {
                "$sum": {"$cond": ["$enabled", 1, 0]}
            }
        }},
        {"$sort": {"_id.framework": 1, "_id.control_id": 1}}
    ]
    
    controls = await db.rules.aggregate(control_pipeline).to_list(length=1000)
    
    return {
        "frameworks": [
            {
                "framework": f["_id"] or "Unspecified",
                "rule_count": f["rule_count"],
                "enabled_count": f["enabled_count"]
            }
            for f in frameworks
        ],
        "controls": [
            {
                "framework": c["_id"]["framework"],
                "control_id": c["_id"]["control_id"],
                "rule_count": c["rule_count"],
                "enabled_count": c["enabled_count"]
            }
            for c in controls
        ]
    }


@router.get("/trends")
async def get_trends(
    days: int = 30,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get violation trends over time
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Get violations from last N days
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {
            "company_id": company_id,
            "created_at": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "severity": "$severity"
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    
    results = await db.violations.aggregate(pipeline).to_list(length=1000)
    
    # Format results
    trends = {}
    for result in results:
        date = result["_id"]["date"]
        severity = result["_id"]["severity"]
        count = result["count"]
        
        if date not in trends:
            trends[date] = {"date": date, "LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        
        trends[date][severity] = count
    
    return list(trends.values())
