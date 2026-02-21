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


class PolicyOut(BaseModel):
    """Response model for policy"""
    id: str = Field(alias="_id")
    name: str
    description: Optional[str] = None
    version: str
    extracted_text: str
    text_length: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: lambda v: str(v)
        }


class PolicySummary(BaseModel):
    """Lightweight policy summary"""
    id: str = Field(alias="_id")
    name: str
    version: str
    text_length: int
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
