"""
Scan execution endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from bson import ObjectId

from app.db import get_database
from app.models.scan import ScanRequest, ScanSummary, ScanRun
from app.services.scan_service import run_scan

router = APIRouter()


@router.post("/run", response_model=ScanSummary, status_code=201)
async def execute_scan(request: ScanRequest):
    """
    Execute a compliance scan across specified collections
    
    This endpoint:
    1. Loads enabled rules (optionally filtered by collections/rule_ids)
    2. Executes each rule's query against the target collection
    3. Records violations in the violations collection
    4. Returns a summary of the scan results
    """
    try:
        summary = await run_scan(
            collections=request.collections,
            rule_ids=request.rule_ids
        )
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan execution failed: {str(e)}")


@router.get("/runs", response_model=List[ScanRun])
async def list_scan_runs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    List historical scan runs with pagination
    """
    db = get_database()
    
    cursor = db.scan_runs.find().sort("started_at", -1).skip(offset).limit(limit)
    scan_runs = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for scan_run in scan_runs:
        scan_run["_id"] = str(scan_run["_id"])
    
    return [ScanRun(**scan_run) for scan_run in scan_runs]


@router.get("/runs/{scan_run_id}", response_model=ScanRun)
async def get_scan_run(scan_run_id: str):
    """
    Get details of a specific scan run
    """
    db = get_database()
    
    if not ObjectId.is_valid(scan_run_id):
        raise HTTPException(status_code=400, detail="Invalid scan run ID format")
    
    scan_run = await db.scan_runs.find_one({"_id": ObjectId(scan_run_id)})
    
    if not scan_run:
        raise HTTPException(status_code=404, detail="Scan run not found")
    
    scan_run["_id"] = str(scan_run["_id"])
    return ScanRun(**scan_run)


@router.delete("/runs/{scan_run_id}", status_code=204)
async def delete_scan_run(scan_run_id: str):
    """
    Delete a scan run and its associated violations
    """
    db = get_database()
    
    if not ObjectId.is_valid(scan_run_id):
        raise HTTPException(status_code=400, detail="Invalid scan run ID format")
    
    # Delete scan run
    result = await db.scan_runs.delete_one({"_id": ObjectId(scan_run_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scan run not found")
    
    # Delete associated violations
    await db.violations.delete_many({"scan_run_id": scan_run_id})
    
    return None
