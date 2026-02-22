"""
Violation management endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.violation import (
    Violation, ViolationUpdate, ViolationStatus, ViolationComment,
    CommentIn, AssignmentUpdate
)
from app.routes.auth import get_current_user, TokenData

router = APIRouter()


@router.get("/", response_model=List[Violation])
async def list_violations(
    rule_id: Optional[str] = Query(None, description="Filter by rule ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[ViolationStatus] = Query(None, description="Filter by status"),
    scan_run_id: Optional[str] = Query(None, description="Filter by scan run ID"),
    framework: Optional[str] = Query(None, description="Filter by framework"),
    control_id: Optional[str] = Query(None, description="Filter by control ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user)
):
    """
    List violations with optional filters and pagination
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Build query filter
    query_filter = {"company_id": company_id}
    if rule_id:
        query_filter["rule_id"] = rule_id
    if severity:
        query_filter["severity"] = severity
    if status:
        query_filter["status"] = status
    if scan_run_id:
        query_filter["scan_run_id"] = scan_run_id
    
    # If framework or control_id filter, need to join with rules
    if framework or control_id:
        rule_filter = {"company_id": company_id}
        if framework:
            rule_filter["framework"] = framework
        if control_id:
            rule_filter["control_id"] = control_id
        
        rules = await db.rules.find(rule_filter, {"_id": 1}).to_list(length=1000)
        rule_ids = [str(r["_id"]) for r in rules]
        query_filter["rule_id"] = {"$in": rule_ids}
    
    # Execute query
    cursor = db.violations.find(query_filter).sort("created_at", -1).skip(offset).limit(limit)
    violations = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string and ensure comments field exists
    for violation in violations:
        violation["_id"] = str(violation["_id"])
        if "comments" not in violation:
            violation["comments"] = []
        if "assigned_to_user_id" not in violation:
            violation["assigned_to_user_id"] = None
        if "assigned_to_user_name" not in violation:
            violation["assigned_to_user_name"] = None
    
    return [Violation(**violation) for violation in violations]


@router.get("/{violation_id}", response_model=Violation)
async def get_violation(violation_id: str, current_user: TokenData = Depends(get_current_user)):
    """
    Get a specific violation by ID
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    violation = await db.violations.find_one({
        "_id": ObjectId(violation_id),
        "company_id": company_id
    })
    
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    violation["_id"] = str(violation["_id"])
    if "comments" not in violation:
        violation["comments"] = []
    if "assigned_to_user_id" not in violation:
        violation["assigned_to_user_id"] = None
    if "assigned_to_user_name" not in violation:
        violation["assigned_to_user_name"] = None
    
    return Violation(**violation)


@router.patch("/{violation_id}", response_model=Violation)
async def update_violation(
    violation_id: str,
    update: ViolationUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update violation status and add reviewer notes
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    # Build update document
    update_data = update.model_dump(exclude_none=True)
    update_data["reviewed_at"] = datetime.utcnow()
    
    # Update violation
    result = await db.violations.find_one_and_update(
        {"_id": ObjectId(violation_id), "company_id": company_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    result["_id"] = str(result["_id"])
    if "comments" not in result:
        result["comments"] = []
    if "assigned_to_user_id" not in result:
        result["assigned_to_user_id"] = None
    if "assigned_to_user_name" not in result:
        result["assigned_to_user_name"] = None
    
    return Violation(**result)


@router.post("/{violation_id}/comment", response_model=Violation)
async def add_comment(
    violation_id: str,
    comment_data: CommentIn,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Add a comment to a violation
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    # Create comment
    comment = ViolationComment(
        user_id=current_user.user_id,
        user_name=current_user.email,
        comment=comment_data.comment,
        created_at=datetime.utcnow()
    )
    
    # Add comment to violation
    result = await db.violations.find_one_and_update(
        {"_id": ObjectId(violation_id), "company_id": company_id},
        {"$push": {"comments": comment.model_dump()}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    result["_id"] = str(result["_id"])
    if "comments" not in result:
        result["comments"] = []
    if "assigned_to_user_id" not in result:
        result["assigned_to_user_id"] = None
    if "assigned_to_user_name" not in result:
        result["assigned_to_user_name"] = None
    
    return Violation(**result)


@router.patch("/{violation_id}/assign", response_model=Violation)
async def assign_violation(
    violation_id: str,
    assignment: AssignmentUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Assign a violation to a user
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    # Update assignment
    result = await db.violations.find_one_and_update(
        {"_id": ObjectId(violation_id), "company_id": company_id},
        {"$set": {
            "assigned_to_user_id": assignment.assigned_to_user_id,
            "assigned_to_user_name": assignment.assigned_to_user_name
        }},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    result["_id"] = str(result["_id"])
    if "comments" not in result:
        result["comments"] = []
    
    return Violation(**result)


@router.delete("/{violation_id}", status_code=204)
async def delete_violation(violation_id: str, current_user: TokenData = Depends(get_current_user)):
    """
    Delete a violation record
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID format")
    
    result = await db.violations.delete_one({
        "_id": ObjectId(violation_id),
        "company_id": company_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    return None



@router.get("/{violation_id}/explain")
async def explain_violation(
    violation_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get human-readable explanation for a violation
    """
    from app.services.explainability_service import generate_violation_explanation
    
    db = get_database()
    
    if not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid violation ID")
    
    # Get violation
    violation = await db.violations.find_one({
        "_id": ObjectId(violation_id),
        "company_id": current_user.company_id
    })
    
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    # Get associated rule
    rule = await db.rules.find_one({
        "_id": ObjectId(violation["rule_id"]),
        "company_id": current_user.company_id
    })
    
    if not rule:
        return {
            "rule_summary": "Rule not found",
            "dataset_mapping": None,
            "reasons": ["Unable to generate explanation - rule not found"],
            "threshold_info": None
        }
    
    # Get dataset recommendation if mapped
    recommendation = None
    control_id = rule.get("control_id")
    if control_id:
        recommendation = await db.dataset_recommendations.find_one({
            "control_id": control_id
        })
    
    # Generate explanation
    explanation = generate_violation_explanation(violation, rule, recommendation)
    
    return explanation
