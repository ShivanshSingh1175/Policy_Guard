"""
Violation management endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.violation import Violation, ViolationUpdate, ViolationStatus

router = APIRouter()


@router.get("/", response_model=List[Violation])
async def list_violations(
    rule_id: Optional[str] = Query(None, description="Filter by rule ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[ViolationStatus] = Query(None, description="Filter by status"),
    scan_run_id: Optional[str] = Query(None, description="Filter by scan run ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    List violations with optional filters and pagination
    """
    db = get_database()
    
    # Build query filter
    query_filter = {}
    if rule_id:
        query_filter["rule_id"] = rule_id
    if severity:
        query_filter["severity"] = severity
    if status:
        query_filter["status"] = status
    if scan_run_id:
        query_filter["scan_run_id"] = scan_run_id
    
    # Execute query
    cursor = db.violations.find(query_filter).sort("created_at", -1).skip(offset).limit(limit)
    violations = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for violation in violations:
        violation["_id"] = str(violation["_id"])
    
    return [Violation(**violation) for violation in violations]


@router.get("/{violation_id}", response_model=Violation)
async def get_violation(violation_id: str):
    """
    Get a specific violation by ID
    """
    db = get_database()
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    violation = await db.violations.find_one({"_id": ObjectId(violation_id)})
    
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    violation["_id"] = str(violation["_id"])
    return Violation(**violation)


@router.patch("/{violation_id}", response_model=Violation)
async def update_violation(violation_id: str, update: ViolationUpdate):
    """
    Update violation status and add reviewer notes
    """
    db = get_database()
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    # Build update document
    update_data = update.model_dump(exclude_none=True)
    update_data["reviewed_at"] = datetime.utcnow()
    
    # Update violation
    result = await db.violations.find_one_and_update(
        {"_id": ObjectId(violation_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    result["_id"] = str(result["_id"])
    return Violation(**result)


@router.delete("/{violation_id}", status_code=204)
async def delete_violation(violation_id: str):
    """
    Delete a violation record
    """
    db = get_database()
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    result = await db.violations.delete_one({"_id": ObjectId(violation_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    return None
