"""
Rule management endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.rule import RuleIn, RuleOut, RuleUpdate
from app.routes.auth import get_current_user, TokenData

router = APIRouter()


@router.get("/", response_model=List[RuleOut])
async def list_rules(
    collection: Optional[str] = Query(None, description="Filter by collection name"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled status"),
    policy_id: Optional[str] = Query(None, description="Filter by policy ID"),
    framework: Optional[str] = Query(None, description="Filter by compliance framework"),
    control_id: Optional[str] = Query(None, description="Filter by control ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user)
):
    """
    List rules with optional filters and pagination
    """
    db = get_database()
    
    # Build query filter with company_id
    query_filter = {"company_id": current_user.company_id}
    if collection:
        query_filter["collection"] = collection
    if enabled is not None:
        query_filter["enabled"] = enabled
    if policy_id:
        query_filter["policy_id"] = policy_id
    if framework:
        query_filter["framework"] = framework
    if control_id:
        query_filter["control_id"] = control_id
    
    # Execute query
    cursor = db.rules.find(query_filter).sort("created_at", -1).skip(offset).limit(limit)
    rules = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for rule in rules:
        rule["_id"] = str(rule["_id"])
    
    return [RuleOut(**rule) for rule in rules]


@router.get("/{rule_id}", response_model=RuleOut)
async def get_rule(
    rule_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a specific rule by ID
    """
    db = get_database()
    
    if not ObjectId.is_valid(rule_id):
        raise HTTPException(status_code=400, detail="Invalid rule ID format")
    
    rule = await db.rules.find_one({
        "_id": ObjectId(rule_id),
        "company_id": current_user.company_id
    })
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule["_id"] = str(rule["_id"])
    return RuleOut(**rule)


@router.post("/", response_model=RuleOut, status_code=201)
async def create_rule(
    rule: RuleIn,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Manually create a new rule
    """
    db = get_database()
    
    # Verify policy exists and belongs to company
    if not ObjectId.is_valid(rule.policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    policy = await db.policies.find_one({
        "_id": ObjectId(rule.policy_id),
        "company_id": current_user.company_id
    })
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Create rule document
    now = datetime.utcnow()
    rule_doc = rule.model_dump()
    rule_doc["company_id"] = current_user.company_id
    rule_doc["created_at"] = now
    rule_doc["updated_at"] = now
    
    result = await db.rules.insert_one(rule_doc)
    rule_doc["_id"] = str(result.inserted_id)
    
    return RuleOut(**rule_doc)


@router.patch("/{rule_id}", response_model=RuleOut)
async def update_rule(
    rule_id: str,
    update: RuleUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update rule fields (including toggling enabled status)
    """
    db = get_database()
    
    if not ObjectId.is_valid(rule_id):
        raise HTTPException(status_code=400, detail="Invalid rule ID format")
    
    # Build update document
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Update rule (with company_id check)
    result = await db.rules.find_one_and_update(
        {
            "_id": ObjectId(rule_id),
            "company_id": current_user.company_id
        },
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    result["_id"] = str(result["_id"])
    return RuleOut(**result)


@router.delete("/{rule_id}", status_code=204)
async def delete_rule(
    rule_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Delete a rule
    """
    db = get_database()
    
    if not ObjectId.is_valid(rule_id):
        raise HTTPException(status_code=400, detail="Invalid rule ID format")
    
    result = await db.rules.delete_one({
        "_id": ObjectId(rule_id),
        "company_id": current_user.company_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    return None
