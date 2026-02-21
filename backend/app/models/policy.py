"""
Pydantic models for Policy documents
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    """Custom type for MongoDB ObjectId"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class PolicyIn(BaseModel):
    """Request model for creating a policy"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    version: Optional[str] = "1.0"
    # company_id will be injected from JWT token


class PolicyUpdate(BaseModel):
    """Request model for updating a policy"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    version: Optional[str] = None


class PolicyOut(BaseModel):
    """Response model for policy"""
    id: str = Field(validation_alias="_id")
    company_id: str
    name: str
    description: Optional[str] = None
    version: str
    file_name: Optional[str] = None
    extracted_text: str
    text_length: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class PolicySummary(BaseModel):
    """Lightweight policy summary"""
    id: str = Field(validation_alias="_id")
    company_id: str
    name: str
    description: Optional[str] = None
    version: str
    text_length: int
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
