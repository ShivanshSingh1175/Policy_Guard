"""
Pydantic models for Violation documents
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ViolationStatus(str, Enum):
    """Violation review status"""
    OPEN = "OPEN"
    CONFIRMED = "CONFIRMED"
    DISMISSED = "DISMISSED"
    FALSE_POSITIVE = "FALSE_POSITIVE"


class ViolationComment(BaseModel):
    """Comment on a violation"""
    user_id: str
    user_name: str
    comment: str
    created_at: datetime


class Violation(BaseModel):
    """Model for a violation document"""
    id: str = Field(validation_alias="_id")
    company_id: str
    scan_run_id: str
    rule_id: str
    rule_name: str
    collection: str
    document_id: str = Field(description="ID of the violating document")
    document_data: Dict[str, Any] = Field(description="Snapshot of violating document")
    severity: str
    status: ViolationStatus = ViolationStatus.OPEN
    explanation: Optional[str] = Field(None, description="AI-generated explanation of the violation")
    reviewer_note: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    remediation_suggestions: Optional[List[Dict[str, Any]]] = Field(None, description="AI-generated remediation suggestions")
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = None
    comments: List[ViolationComment] = Field(default_factory=list)
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ViolationUpdate(BaseModel):
    """Model for updating violation status"""
    status: ViolationStatus
    reviewer_note: Optional[str] = None
    reviewed_by: Optional[str] = None


class ViolationFilters(BaseModel):
    """Query filters for listing violations"""
    rule_id: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[ViolationStatus] = None
    scan_run_id: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)


class CommentIn(BaseModel):
    """Request model for adding a comment"""
    comment: str = Field(..., min_length=1, max_length=2000)


class AssignmentUpdate(BaseModel):
    """Request model for assigning a violation"""
    assigned_to_user_id: Optional[str] = None
    assigned_to_user_name: Optional[str] = None
