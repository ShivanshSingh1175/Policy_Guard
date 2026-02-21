"""
Case Management endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.case import CaseIn, CaseOut, CaseUpdate, CommentIn, CaseStatus, CaseSeverity, CaseComment
from app.routes.auth import get_current_user, TokenData

router = APIRouter()


@router.post("/", response_model=CaseOut, status_code=201)
async def create_case(case_data: CaseIn, current_user: TokenData = Depends(get_current_user)):
    """
    Create a new case from one or more violations
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Validate violation IDs exist and belong to company
    if case_data.violation_ids:
        violation_ids = [ObjectId(vid) for vid in case_data.violation_ids if ObjectId.is_valid(vid)]
        violations = await db.violations.find({
            "_id": {"$in": violation_ids},
            "company_id": company_id
        }).to_list(length=len(violation_ids))
        
        if len(violations) != len(violation_ids):
            raise HTTPException(status_code=400, detail="Some violation IDs are invalid or not accessible")
    
    # Create case document
    case_doc = {
        "company_id": company_id,
        "title": case_data.title,
        "primary_account_id": case_data.primary_account_id,
        "severity": case_data.severity,
        "status": CaseStatus.OPEN,
        "assigned_to_user_id": case_data.assigned_to_user_id,
        "assigned_to_user_name": None,  # TODO: Fetch from users collection
        "linked_violation_ids": case_data.violation_ids,
        "comments": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": current_user.user_id,
        "created_by_name": current_user.email  # Simplified
    }
    
    result = await db.cases.insert_one(case_doc)
    case_doc["_id"] = str(result.inserted_id)
    
    return CaseOut(**case_doc)


@router.get("/", response_model=List[CaseOut])
async def list_cases(
    status: Optional[CaseStatus] = Query(None, description="Filter by status"),
    severity: Optional[CaseSeverity] = Query(None, description="Filter by severity"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user)
):
    """
    List cases with optional filters and pagination
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Build query filter
    query_filter = {"company_id": company_id}
    if status:
        query_filter["status"] = status
    if severity:
        query_filter["severity"] = severity
    if assigned_to:
        query_filter["assigned_to_user_id"] = assigned_to
    
    # Execute query
    cursor = db.cases.find(query_filter).sort("created_at", -1).skip(offset).limit(limit)
    cases = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for case in cases:
        case["_id"] = str(case["_id"])
    
    return [CaseOut(**case) for case in cases]


@router.get("/{case_id}", response_model=CaseOut)
async def get_case(case_id: str, current_user: TokenData = Depends(get_current_user)):
    """
    Get a specific case by ID with linked violations
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    case = await db.cases.find_one({
        "_id": ObjectId(case_id),
        "company_id": company_id
    })
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case["_id"] = str(case["_id"])
    return CaseOut(**case)


@router.patch("/{case_id}", response_model=CaseOut)
async def update_case(
    case_id: str,
    update: CaseUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update case fields (status, title, assignment, etc.)
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Build update document
    update_data = update.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Update case
    result = await db.cases.find_one_and_update(
        {"_id": ObjectId(case_id), "company_id": company_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Case not found")
    
    result["_id"] = str(result["_id"])
    return CaseOut(**result)


@router.post("/{case_id}/comment", response_model=CaseOut)
async def add_comment(
    case_id: str,
    comment_data: CommentIn,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Add a comment to a case
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Create comment
    comment = CaseComment(
        user_id=current_user.user_id,
        user_name=current_user.email, # Simplified
        comment=comment_data.comment,
        created_at=datetime.utcnow()
    )
    
    # Add comment to case
    result = await db.cases.find_one_and_update(
        {"_id": ObjectId(case_id), "company_id": company_id},
        {
            "$push": {"comments": comment.model_dump()},
            "$set": {"updated_at": datetime.utcnow()}
        },
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Case not found")
    
    result["_id"] = str(result["_id"])
    return CaseOut(**result)


@router.post("/{case_id}/violations/{violation_id}", response_model=CaseOut)
async def link_violation(
    case_id: str,
    violation_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Link an additional violation to an existing case
    """
    db = get_database()
    company_id = current_user["company_id"]
    
    if not ObjectId.is_valid(case_id) or not ObjectId.is_valid(violation_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Verify violation exists and belongs to company
    violation = await db.violations.find_one({
        "_id": ObjectId(violation_id),
        "company_id": company_id
    })
    
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    # Add violation to case
    result = await db.cases.find_one_and_update(
        {"_id": ObjectId(case_id), "company_id": company_id},
        {
            "$addToSet": {"linked_violation_ids": violation_id},
            "$set": {"updated_at": datetime.utcnow()}
        },
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Case not found")
    
    result["_id"] = str(result["_id"])
    return CaseOut(**result)
