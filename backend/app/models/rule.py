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


class RuleOut(BaseModel):
    """Response model for rule"""
    id: str = Field(alias="_id")
    policy_id: str
    name: str
    description: str
    collection: str
    query: Dict[str, Any]
    severity: RuleSeverity
    enabled: bool
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RuleUpdate(BaseModel):
    """Model for updating rule fields"""
    name: Optional[str] = None
    description: Optional[str] = None
    query: Optional[Dict[str, Any]] = None
    severity: Optional[RuleSeverity] = None
    enabled: Optional[bool] = None
    tags: Optional[List[str]] = None
