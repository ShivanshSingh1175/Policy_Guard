"""
Settings and configuration routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.alert import AlertConfigIn, AlertConfigOut
from app.models.schedule import ScanScheduleIn, ScanScheduleOut, ControlHealth
from app.models.user import TokenData
from app.routes.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.post("/alerts", response_model=AlertConfigOut, status_code=201)
async def create_alert_config(
    config: AlertConfigIn,
    current_user: TokenData = Depends(get_current_user)
):
    """Create or update alert configuration"""
    db = get_database()
    
    config_doc = {
        "company_id": current_user.company_id,
        "channel": config.channel,
        "enabled": config.enabled,
        "email_recipients": config.email_recipients,
        "slack_webhook_url": config.slack_webhook_url,
        "webhook_url": config.webhook_url,
        "min_severity": config.min_severity,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.alert_configs.insert_one(config_doc)
    config_doc["_id"] = result.inserted_id
    
    return AlertConfigOut(
        id=str(result.inserted_id),
        **{k: v for k, v in config_doc.items() if k != "_id"}
    )


@router.get("/alerts", response_model=List[AlertConfigOut])
async def list_alert_configs(current_user: TokenData = Depends(get_current_user)):
    """List all alert configurations for the company"""
    db = get_database()
    
    configs = await db.alert_configs.find({
        "company_id": current_user.company_id
    }).to_list(100)
    
    return [
        AlertConfigOut(id=str(c["_id"]), **{k: v for k, v in c.items() if k != "_id"})
        for c in configs
    ]


@router.post("/schedules", response_model=ScanScheduleOut, status_code=201)
async def create_scan_schedule(
    schedule: ScanScheduleIn,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new scan schedule"""
    db = get_database()
    
    schedule_doc = {
        "company_id": current_user.company_id,
        "name": schedule.name,
        "description": schedule.description,
        "frequency": schedule.frequency,
        "interval_hours": schedule.interval_hours,
        "collections": schedule.collections,
        "rule_ids": schedule.rule_ids,
        "enabled": schedule.enabled,
        "last_run": None,
        "next_run": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.scan_schedules.insert_one(schedule_doc)
    schedule_doc["_id"] = result.inserted_id
    
    return ScanScheduleOut(
        id=str(result.inserted_id),
        **{k: v for k, v in schedule_doc.items() if k != "_id"}
    )


@router.get("/schedules", response_model=List[ScanScheduleOut])
async def list_scan_schedules(current_user: TokenData = Depends(get_current_user)):
    """List all scan schedules for the company"""
    db = get_database()
    
    schedules = await db.scan_schedules.find({
        "company_id": current_user.company_id
    }).to_list(100)
    
    return [
        ScanScheduleOut(id=str(s["_id"]), **{k: v for k, v in s.items() if k != "_id"})
        for s in schedules
    ]


@router.get("/control-health", response_model=List[ControlHealth])
async def get_control_health(current_user: TokenData = Depends(get_current_user)):
    """Get health metrics for all rules (controls)"""
    db = get_database()
    
    # Aggregate scan results per rule
    pipeline = [
        {"$match": {"company_id": current_user.company_id}},
        {"$unwind": "$rule_results"},
        {"$group": {
            "_id": "$rule_results.rule_id",
            "rule_name": {"$first": "$rule_results.rule_name"},
            "last_run": {"$max": "$started_at"},
            "total_runs": {"$sum": 1},
            "total_violations": {"$sum": "$rule_results.violations_found"}
        }}
    ]
    
    results = await db.scan_runs.aggregate(pipeline).to_list(1000)
    
    return [
        ControlHealth(
            rule_id=r["_id"],
            rule_name=r["rule_name"],
            last_run=r["last_run"],
            last_success=r["last_run"],
            total_runs=r["total_runs"],
            failed_runs=0,
            violation_rate=r["total_violations"] / r["total_runs"] if r["total_runs"] > 0 else 0,
            avg_violations=r["total_violations"] / r["total_runs"] if r["total_runs"] > 0 else 0
        )
        for r in results
    ]
