"""
Pydantic models for Rule documents
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class RuleSeverity(str, Enum):
    """Rule severity levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RuleIn(BaseModel):
    """Request model for creating a rule"""
    policy_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str
    collection: str = Field(..., description="Target MongoDB collection to scan")
    query: Dict[str, Any] = Field(..., description="MongoDB query/aggregation pipeline")
    severity: RuleSeverity = RuleSeverity.MEDIUM
    enabled: bool = True
    tags: List[str] = Field(default_factory=list)
    framework: Optional[str] = Field(default="AML", description="Compliance framework (e.g., AML, KYC, GDPR)")
    control_id: Optional[str] = Field(default=None, description="Control ID within framework")
    # company_id will be injected from JWT token


class RuleOut(BaseModel):
    """Response model for rule"""
    id: str = Field(validation_alias="_id")
    company_id: str
    policy_id: Optional[str] = None
    name: str
    description: str
    collection: str
    query: Optional[Dict[str, Any]] = None
    condition: Optional[Dict[str, Any]] = None
    pipeline: Optional[List[Dict[str, Any]]] = None
    severity: RuleSeverity
    enabled: bool
    tags: List[str] = Field(default_factory=list)
    framework: Optional[str] = Field(default="AML")
    control_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class RuleUpdate(BaseModel):
    """Model for updating rule fields"""
    name: Optional[str] = None
    description: Optional[str] = None
    query: Optional[Dict[str, Any]] = None
    severity: Optional[RuleSeverity] = None
    enabled: Optional[bool] = None
    tags: Optional[List[str]] = None
    framework: Optional[str] = None
    control_id: Optional[str] = None
