"""
Policy management endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.policy import PolicyOut, PolicySummary, PolicyUpdate
from app.models.rule import RuleOut
from app.services.pdf_service import extract_text_from_pdf
from app.services.llm_service import generate_rules_from_policy
from app.routes.auth import get_current_user, TokenData

router = APIRouter()


@router.post("/upload", response_model=PolicyOut, status_code=201)
async def upload_policy(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    version: str = Form("1.0"),
    current_user: TokenData = Depends(get_current_user)
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
        "company_id": current_user.company_id,
        "name": name,
        "description": description,
        "version": version,
        "file_name": file.filename,
        "extracted_text": extracted_text,
        "text_length": len(extracted_text),
        "created_at": now,
        "updated_at": now,
        "created_by": current_user.user_id
    }
    
    result = await db.policies.insert_one(policy_doc)
    policy_doc["_id"] = str(result.inserted_id)
    
    return PolicyOut(**policy_doc)


@router.get("/", response_model=List[PolicySummary])
async def list_policies(
    limit: int = 50,
    offset: int = 0,
    current_user: TokenData = Depends(get_current_user)
):
    """
    List all policies for the current company with pagination
    """
    db = get_database()
    
    cursor = db.policies.find(
        {"company_id": current_user.company_id}
    ).sort("created_at", -1).skip(offset).limit(limit)
    
    policies = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for policy in policies:
        policy["_id"] = str(policy["_id"])
    
    return [PolicySummary(**policy) for policy in policies]


@router.get("/{policy_id}", response_model=PolicyOut)
async def get_policy(
    policy_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a specific policy by ID
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    policy = await db.policies.find_one({
        "_id": ObjectId(policy_id),
        "company_id": current_user.company_id
    })
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy["_id"] = str(policy["_id"])
    return PolicyOut(**policy)


@router.patch("/{policy_id}", response_model=PolicyOut)
async def update_policy(
    policy_id: str,
    update: PolicyUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update policy metadata
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    # Build update document
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.policies.find_one_and_update(
        {"_id": ObjectId(policy_id), "company_id": current_user.company_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    result["_id"] = str(result["_id"])
    return PolicyOut(**result)


@router.post("/{policy_id}/extract-rules", status_code=201)
async def extract_rules_from_policy(
    policy_id: str,
    auto_scan: bool = False,
    schema_hint: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Use LLM to generate rules from policy text and store them.
    Optionally run an immediate scan on existing data.
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    # Fetch policy (with company_id check)
    policy = await db.policies.find_one({
        "_id": ObjectId(policy_id),
        "company_id": current_user.company_id
    })
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Generate rules using LLM
    try:
        rules_data = await generate_rules_from_policy(
            policy["extracted_text"],
            schema_hint
        )
    except Exception as e:
        print(f"LLM rule generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate rules: {str(e)}")
    
    if not rules_data:
        raise HTTPException(status_code=400, detail="No rules could be generated from the policy")
    
    # Store rules in database
    now = datetime.utcnow()
    created_rules = []
    rule_ids = []
    
    for rule_data in rules_data:
        rule_doc = {
            "company_id": current_user.company_id,
            "policy_id": policy_id,
            "name": rule_data.name,
            "description": rule_data.description,
            "collection": rule_data.collection,
            "query": rule_data.query,
            "severity": rule_data.severity,
            "enabled": rule_data.enabled,
            "tags": rule_data.tags,
            "framework": rule_data.framework if hasattr(rule_data, 'framework') else "AML",
            "control_id": rule_data.control_id if hasattr(rule_data, 'control_id') else None,
            "explanation": rule_data.description,  # Use description as explanation
            "created_at": now,
            "updated_at": now
        }
        
        result = await db.rules.insert_one(rule_doc)
        rule_doc["_id"] = str(result.inserted_id)
        rule_ids.append(str(result.inserted_id))
        created_rules.append(RuleOut(**rule_doc))
    
    # If auto_scan is enabled, run scan immediately
    scan_summary = None
    if auto_scan and created_rules:
        from app.services.scan_service import run_scan
        
        try:
            scan_result = await run_scan(
                company_id=current_user.company_id,
                collections=None,  # Scan all collections
                rule_ids=rule_ids  # Only use newly created rules
            )
            
            # Get violation counts by severity
            violations = await db.violations.find({
                "company_id": current_user.company_id,
                "scan_run_id": scan_result.scan_run_id
            }).to_list(length=None)
            
            severity_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "CRITICAL": 0}
            rule_counts = {}
            account_counts = {}
            
            for v in violations:
                severity = v.get("severity", "LOW")
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
                
                # Count by rule
                rule_id = v.get("rule_id")
                rule_name = v.get("rule_name", "Unknown")
                if rule_id:
                    if rule_id not in rule_counts:
                        rule_counts[rule_id] = {"rule_id": rule_id, "rule_name": rule_name, "count": 0}
                    rule_counts[rule_id]["count"] += 1
                
                # Count by account
                doc_data = v.get("document_data", {})
                account_id = doc_data.get("account_id") or doc_data.get("src_account") or doc_data.get("dst_account")
                if account_id:
                    if account_id not in account_counts:
                        account_counts[account_id] = {"account_id": account_id, "count": 0}
                    account_counts[account_id]["count"] += 1
            
            # Get top 3 rules and accounts
            top_rules = sorted(rule_counts.values(), key=lambda x: x["count"], reverse=True)[:3]
            top_accounts = sorted(account_counts.values(), key=lambda x: x["count"], reverse=True)[:3]
            
            scan_summary = {
                "scan_run_id": scan_result.scan_run_id,
                "total_violations": scan_result.total_violations_found,
                "high": severity_counts.get("HIGH", 0),
                "medium": severity_counts.get("MEDIUM", 0),
                "low": severity_counts.get("LOW", 0),
                "critical": severity_counts.get("CRITICAL", 0),
                "execution_time_seconds": scan_result.execution_time_seconds,
                "top_rules": top_rules,
                "top_accounts": top_accounts
            }
        except Exception as e:
            print(f"Auto-scan error: {str(e)}")
            # Don't fail the whole request if scan fails
            scan_summary = {"error": str(e)}
    
    return {
        "rules_created": len(created_rules),
        "rules": [rule.model_dump() for rule in created_rules],
        "scan_summary": scan_summary
    }


@router.delete("/{policy_id}", status_code=204)
async def delete_policy(
    policy_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Delete a policy and its associated rules
    """
    db = get_database()
    
    if not ObjectId.is_valid(policy_id):
        raise HTTPException(status_code=400, detail="Invalid policy ID format")
    
    # Delete policy (with company_id check)
    result = await db.policies.delete_one({
        "_id": ObjectId(policy_id),
        "company_id": current_user.company_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Delete associated rules
    await db.rules.delete_many({
        "policy_id": policy_id,
        "company_id": current_user.company_id
    })
    
    return None
