"""
Scan scheduling models
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class ScheduleFrequency(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    CUSTOM = "custom"


class ScanScheduleIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    frequency: ScheduleFrequency
    interval_hours: Optional[int] = Field(None, ge=1, le=168)  # Max 1 week
    collections: List[str] = ["transactions"]
    rule_ids: List[str] = []  # Empty means all enabled rules
    enabled: bool = True


class ScanScheduleOut(BaseModel):
    id: str
    company_id: str
    name: str
    description: Optional[str] = None
    frequency: ScheduleFrequency
    interval_hours: Optional[int] = None
    collections: List[str]
    rule_ids: List[str]
    enabled: bool
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ControlHealth(BaseModel):
    rule_id: str
    rule_name: str
    last_run: Optional[datetime] = None
    last_success: Optional[datetime] = None
    total_runs: int = 0
    failed_runs: int = 0
    violation_rate: float = 0.0  # Violations per run
    avg_violations: float = 0.0
