"""
Account and risk scoring models
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AccountRiskScore(BaseModel):
    account_id: str
    company_id: str
    risk_level: RiskLevel
    risk_score: float = Field(..., ge=0, le=100)
    violation_count: int = 0
    high_severity_count: int = 0
    medium_severity_count: int = 0
    low_severity_count: int = 0
    last_violation_date: Optional[datetime] = None
    calculated_at: datetime


class AccountDetail(BaseModel):
    account_id: str
    company_id: str
    account_type: Optional[str] = None
    balance: Optional[float] = None
    status: Optional[str] = None
    created_date: Optional[datetime] = None
    risk_score: Optional[AccountRiskScore] = None
    recent_violations: List[dict] = []
    transaction_count: int = 0


class RemediationSuggestion(BaseModel):
    action: str
    priority: str  # "high", "medium", "low"
    description: str
    estimated_effort: Optional[str] = None
