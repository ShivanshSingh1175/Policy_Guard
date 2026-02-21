"""
Alert configuration and notification models
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl


class AlertChannel(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"


class AlertConfig(BaseModel):
    company_id: str
    channel: AlertChannel
    enabled: bool = True
    email_recipients: Optional[list[EmailStr]] = None
    slack_webhook_url: Optional[HttpUrl] = None
    webhook_url: Optional[HttpUrl] = None
    min_severity: str = "HIGH"  # Only alert on HIGH or CRITICAL


class AlertConfigIn(BaseModel):
    channel: AlertChannel
    enabled: bool = True
    email_recipients: Optional[list[EmailStr]] = None
    slack_webhook_url: Optional[str] = None
    webhook_url: Optional[str] = None
    min_severity: str = "HIGH"


class AlertConfigOut(BaseModel):
    id: str
    company_id: str
    channel: AlertChannel
    enabled: bool
    email_recipients: Optional[list[str]] = None
    slack_webhook_url: Optional[str] = None
    webhook_url: Optional[str] = None
    min_severity: str
    created_at: datetime
    updated_at: datetime
