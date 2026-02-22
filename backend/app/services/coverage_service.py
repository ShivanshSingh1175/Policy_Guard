"""
Coverage service - computes implementation coverage metrics
"""
from typing import Dict, Any
from datetime import datetime


async def compute_coverage_metrics(db, company_id: str) -> Dict[str, Any]:
    """
    Computes coverage metrics for a company
    """
    # Count total recommendations for this company (or global)
    total_recommendations = await db.dataset_recommendations.count_documents({
        "$or": [
            {"company_id": company_id},
            {"company_id": None}
        ]
    })
    
    # Count implemented recommendations
    implemented_controls = await db.dataset_recommendations.count_documents({
        "$or": [
            {"company_id": company_id},
            {"company_id": None}
        ],
        "implemented": True
    })
    
    # Calculate coverage percentage
    coverage_percent = (implemented_controls / total_recommendations * 100) if total_recommendations > 0 else 0.0
    
    # Get breakdown by risk level
    risk_breakdown = {}
    for risk_level in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        total = await db.dataset_recommendations.count_documents({
            "$or": [
                {"company_id": company_id},
                {"company_id": None}
            ],
            "risk_level": risk_level
        })
        implemented = await db.dataset_recommendations.count_documents({
            "$or": [
                {"company_id": company_id},
                {"company_id": None}
            ],
            "risk_level": risk_level,
            "implemented": True
        })
        risk_breakdown[risk_level] = {
            "total": total,
            "implemented": implemented,
            "coverage": (implemented / total * 100) if total > 0 else 0.0
        }
    
    return {
        "company_id": company_id,
        "total_recommendations": total_recommendations,
        "implemented_controls": implemented_controls,
        "coverage_percent": round(coverage_percent, 2),
        "risk_breakdown": risk_breakdown,
        "last_updated_at": datetime.utcnow()
    }


async def update_recommendation_impact(db, recommendation_id: str, violations_count: int, accounts_count: int):
    """
    Updates the impact metrics for a recommendation after a scan
    """
    await db.dataset_recommendations.update_one(
        {"_id": recommendation_id},
        {
            "$set": {
                "violations_detected": violations_count,
                "accounts_affected": accounts_count,
                "updated_at": datetime.utcnow()
            }
        }
    )
