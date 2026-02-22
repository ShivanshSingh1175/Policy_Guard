"""
Pydantic models for Case Management
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CaseStatus(str, Enum):
    """Case status"""
    OPEN = "OPEN"
    IN_REVIEW = "IN_REVIEW"
    CLOSED = "CLOSED"


class CaseSeverity(str, Enum):
    """Case severity levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SLAStatus(str, Enum):
    """SLA status"""
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    BREACHED = "BREACHED"


class CaseLevel(str, Enum):
    """Case investigation level"""
    L1 = "L1"
    L2 = "L2"
    QA = "QA"


class ActivityLogEntry(BaseModel):
    """Activity log entry"""
    type: str  # "status_change", "assignment", "comment", "created"
    user_id: str
    user_name: str
    message: str
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CaseComment(BaseModel):
    """Comment on a case"""
    user_id: str
    user_name: str
    comment: str
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CaseIn(BaseModel):
    """Request model for creating a case"""
    title: str = Field(..., min_length=1, max_length=200)
    primary_account_id: Optional[str] = None
    severity: CaseSeverity = CaseSeverity.MEDIUM
    violation_ids: List[str] = Field(default_factory=list)
    assigned_to_user_id: Optional[str] = None
    due_by: Optional[datetime] = None
    level: CaseLevel = CaseLevel.L1


class CaseOut(BaseModel):
    """Response model for case"""
    id: str = Field(validation_alias="_id")
    company_id: str
    title: str
    primary_account_id: Optional[str] = None
    severity: CaseSeverity
    status: CaseStatus
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = None
    linked_violation_ids: List[str] = Field(default_factory=list)
    comments: List[CaseComment] = Field(default_factory=list)
    due_by: Optional[datetime] = None
    sla_status: SLAStatus = SLAStatus.ON_TRACK
    level: CaseLevel = CaseLevel.L1
    activity_log: List[ActivityLogEntry] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    created_by: str
    created_by_name: str
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class CaseUpdate(BaseModel):
    """Model for updating case fields"""
    title: Optional[str] = None
    primary_account_id: Optional[str] = None
    severity: Optional[CaseSeverity] = None
    status: Optional[CaseStatus] = None
    assigned_to_user_id: Optional[str] = None
    due_by: Optional[datetime] = None
    level: Optional[CaseLevel] = None


class CommentIn(BaseModel):
    """Request model for adding a comment"""
    comment: str = Field(..., min_length=1, max_length=2000)
