"""
Pydantic models for Scan operations
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class ScanStatus(str, Enum):
    """Scan execution status"""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ScanRequest(BaseModel):
    """Request model for initiating a scan"""
    collections: Optional[List[str]] = Field(
        None,
        description="Specific collections to scan. If None, scans all collections with enabled rules"
    )
    rule_ids: Optional[List[str]] = Field(
        None,
        description="Specific rule IDs to execute. If None, runs all enabled rules"
    )


class RuleScanResult(BaseModel):
    """Result for a single rule execution"""
    rule_id: str
    rule_name: str
    collection: str
    violations_found: int
    execution_time_ms: float


class ScanRun(BaseModel):
    """Model for a scan run document"""
    id: str = Field(validation_alias="_id")
    company_id: str
    status: ScanStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_rules_executed: int
    total_violations_found: int
    collections_scanned: List[str]
    rule_results: List[RuleScanResult]
    error_message: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ScanSummary(BaseModel):
    """Summary response after scan completion"""
    scan_run_id: str
    status: ScanStatus
    total_rules_executed: int
    total_violations_found: int
    execution_time_seconds: float
    rule_results: List[RuleScanResult]
