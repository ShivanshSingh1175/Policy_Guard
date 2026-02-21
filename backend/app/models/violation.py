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


class Violation(BaseModel):
    """Model for a violation document"""
    id: str = Field(alias="_id")
    company_id: str
    scan_run_id: str
    rule_id: str
    rule_name: str
    collection: str
    document_id: str = Field(description="ID of the violating document")
    document_data: Dict[str, Any] = Field(description="Snapshot of violating document")
    severity: str
    status: ViolationStatus = ViolationStatus.OPEN
    reviewer_note: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    remediation_suggestions: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
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
