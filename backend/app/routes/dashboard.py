"""
Dashboard API endpoints
Provides summary metrics and statistics
"""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta

from app.db import get_database
from app.models.user import TokenData
from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get dashboard summary with key metrics (scoped to company)
    """
    company_filter = {"company_id": current_user.company_id}
    
    # Count total violations
    total_violations = await db.violations.count_documents(company_filter)
    
    # Count open violations
    open_violations = await db.violations.count_documents({**company_filter, "status": "OPEN"})
    
    # Count critical violations
    critical_violations = await db.violations.count_documents({**company_filter, "severity": "CRITICAL"})
    
    # Count enabled rules
    enabled_rules = await db.rules.count_documents({**company_filter, "enabled": True})
    
    # Get last scan time
    last_scan = await db.scan_runs.find_one(
        company_filter,
        sort=[("started_at", -1)]
    )
    last_scan_time = last_scan["started_at"].isoformat() if last_scan else None
    
    # Count violations by severity
    violations_by_severity = {
        "LOW": await db.violations.count_documents({**company_filter, "severity": "LOW"}),
        "MEDIUM": await db.violations.count_documents({**company_filter, "severity": "MEDIUM"}),
        "HIGH": await db.violations.count_documents({**company_filter, "severity": "HIGH"}),
        "CRITICAL": await db.violations.count_documents({**company_filter, "severity": "CRITICAL"}),
    }
    
    # Get recent violations (last 10)
    recent_violations_cursor = db.violations.find(
        company_filter,
        sort=[("created_at", -1)],
        limit=10
    )
    recent_violations = []
    async for violation in recent_violations_cursor:
        violation["id"] = str(violation["_id"])
        violation.pop("_id")
        if "created_at" in violation:
            violation["created_at"] = violation["created_at"].isoformat()
        if "updated_at" in violation:
            violation["updated_at"] = violation["updated_at"].isoformat()
        recent_violations.append(violation)
    
    return {
        "total_violations": total_violations,
        "open_violations": open_violations,
        "critical_violations": critical_violations,
        "enabled_rules": enabled_rules,
        "last_scan_time": last_scan_time,
        "violations_by_severity": violations_by_severity,
        "recent_violations": recent_violations
    }
