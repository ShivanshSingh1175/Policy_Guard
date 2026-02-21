"""
User and authentication models
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    ADMIN = "admin"
    COMPLIANCE_OFFICER = "compliance_officer"
    AUDITOR = "auditor"


class CompanyIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    industry: Optional[str] = None
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=8)
    admin_name: str


class CompanyOut(BaseModel):
    id: str
    name: str
    industry: Optional[str] = None
    created_at: datetime
    user_count: int = 0


class UserIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str
    role: UserRole = UserRole.COMPLIANCE_OFFICER
    company_id: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: UserRole
    company_id: str
    company_name: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    user_id: str
    company_id: str
    role: UserRole
    email: str
