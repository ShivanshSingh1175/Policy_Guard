"""
Account and risk scoring routes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from app.db import get_database
from app.models.account import AccountDetail, AccountRiskScore, RiskLevel, AccountSummary
from app.models.user import TokenData
from app.routes.auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("/", response_model=List[AccountSummary])
async def list_accounts(
    limit: int = 50,
    offset: int = 0,
    current_user: TokenData = Depends(get_current_user)
):
    """
    List all accounts for the current company
    """
    db = get_database()
    
    # Build query - handle both with and without company_id for backward compatibility
    query = {"company_id": current_user.company_id}
    
    cursor = db.accounts.find(query).skip(offset).limit(limit)
    accounts = await cursor.to_list(length=limit)
    
    # If no accounts found with company_id, try without (for legacy data)
    if not accounts:
        cursor = db.accounts.find({}).skip(offset).limit(limit)
        accounts = await cursor.to_list(length=limit)
        # Add company_id to legacy accounts
        for account in accounts:
            if "company_id" not in account:
                account["company_id"] = current_user.company_id
    
    # Ensure _id is converted to string for Pydantic
    for account in accounts:
        if "_id" in account:
            account["_id"] = str(account["_id"])
    
    return accounts


@router.get("/{account_id}", response_model=AccountDetail)
async def get_account_detail(
    account_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get account details with risk score and recent violations
    """
    db = get_database()
    
    # Get account from transactions collection (sample)
    account_data = await db.accounts.find_one({
        "account_id": account_id,
        "company_id": current_user.company_id
    })
    
    if not account_data:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get violations for this account (checking various potential account fields)
    violations = await db.violations.find({
        "company_id": current_user.company_id,
        "$or": [
            {"document_data.account_id": account_id},
            {"document_data.src_account": account_id},
            {"document_data.dst_account": account_id}
        ]
    }).sort("created_at", -1).limit(20).to_list(20)
    
    # Calculate risk score
    high_count = sum(1 for v in violations if v.get("severity") == "HIGH")
    medium_count = sum(1 for v in violations if v.get("severity") == "MEDIUM")
    low_count = sum(1 for v in violations if v.get("severity") == "LOW")
    
    risk_score = (high_count * 10 + medium_count * 5 + low_count * 2)
    risk_level = RiskLevel.CRITICAL if risk_score > 50 else \
                 RiskLevel.HIGH if risk_score > 30 else \
                 RiskLevel.MEDIUM if risk_score > 10 else RiskLevel.LOW
    
    risk_score_obj = AccountRiskScore(
        account_id=account_id,
        company_id=current_user.company_id,
        risk_level=risk_level,
        risk_score=min(risk_score, 100),
        violation_count=len(violations),
        high_severity_count=high_count,
        medium_severity_count=medium_count,
        low_severity_count=low_count,
        calculated_at=datetime.utcnow()
    )
    
    return AccountDetail(
        account_id=account_id,
        company_id=current_user.company_id,
        account_type=account_data.get("account_type"),
        balance=account_data.get("balance"),
        status=account_data.get("status"),
        risk_score=risk_score_obj,
        recent_violations=[{
            "id": str(v["_id"]),
            "rule_name": v["rule_name"],
            "severity": v["severity"],
            "created_at": v["created_at"]
        } for v in violations],
        transaction_count=account_data.get("transaction_count", 0)
    )
