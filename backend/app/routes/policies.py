"""
Policy management endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.policy import PolicyOut, PolicySummary
from app.models.rule import RuleOut
from app.services.pdf_service import extract_text_from_pdf
from app.services.llm_service import generate_rules_from_policy

router = APIRouter()


@router.post("/upload", response_model=PolicyOut, status_code=201)
async def upload_policy(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    version: str = Form("1.0")
):
    """
    Upload a policy PDF, extract text, and store in database
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read file content
    file_content = await file.read()
    
    # Extract text from PDF
    try:
        extracted_text = extract_text_from_pdf(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")
    
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
    
    # Create policy document
    db = get_database()
    now = datetime.utcnow()
    
    policy_doc = {
        "name": name,
        "description": description,
        "version": version,
        "extracted_text": extracted_text,
        "text_length": len(extracted_text),
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.policies.insert_one(policy_doc)
    policy_doc["_id"] = str(result.inserted_id)
    
    return PolicyOut(**policy_doc)


@router.get("/", response_model=List[PolicySummary])
async def list_policies(limit: int = 50, offset: int = 0):
    """
    List all policies with pagination
    """
    db = get_database()
    
    cursor = db.policies.find().sort("created_at", -1).skip(offset).limit(limit)
    policies = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for policy in policies:
        policy["_id"] = str(policy["_id"])
    
    return [PolicySummary(**policy) for policy in policies]


@router.get("/{policy_id}", response_model=PolicyOut)
async def get_policy(policy_id: str):
    """
    Get a specific policy by ID
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    policy = await db.policies.find_one({"_id": ObjectId(policy_id)})
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy["_id"] = str(policy["_id"])
    return PolicyOut(**policy)


@router.post("/{policy_id}/extract-rules", response_model=List[RuleOut], status_code=201)
async def extract_rules_from_policy(
    policy_id: str,
    schema_hint: Optional[str] = None
):
    """
    Use LLM to generate rules from policy text and store them
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    # Fetch policy
    policy = await db.policies.find_one({"_id": ObjectId(policy_id)})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Generate rules using LLM
    try:
        rules_data = await generate_rules_from_policy(
            policy["extracted_text"],
            schema_hint
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate rules: {str(e)}")
    
    # Store rules in database
    now = datetime.utcnow()
    created_rules = []
    
    for rule_data in rules_data:
        rule_doc = {
            "policy_id": policy_id,
            "name": rule_data.name,
            "description": rule_data.description,
            "collection": rule_data.collection,
            "query": rule_data.query,
            "severity": rule_data.severity,
            "enabled": rule_data.enabled,
            "tags": rule_data.tags,
            "created_at": now,
            "updated_at": now
        }
        
        result = await db.rules.insert_one(rule_doc)
        rule_doc["_id"] = str(result.inserted_id)
        created_rules.append(RuleOut(**rule_doc))
    
    return created_rules


@router.delete("/{policy_id}", status_code=204)
async def delete_policy(policy_id: str):
    """
    Delete a policy and its associated rules
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    # Delete policy
    result = await db.policies.delete_one({"_id": ObjectId(policy_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Delete associated rules
    await db.rules.delete_many({"policy_id": policy_id})
    
    return None
