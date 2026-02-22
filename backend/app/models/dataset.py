"""
Pydantic models for Dataset Recommendations
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level for recommendations"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DatasetRecommendation(BaseModel):
    """Dataset recommendation model"""
    id: str = Field(validation_alias="_id")
    company_id: Optional[str] = None  # Nullable for global recommendations
    control_id: str
    title: str
    description: str
    threshold_params: Dict[str, Any] = Field(default_factory=dict)
    risk_level: RiskLevel
    regulatory_reference: str
    implemented: bool = False
    mapped_rule_id: Optional[str] = None
    violations_detected: int = 0
    accounts_affected: int = 0
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class DatasetRecommendationIn(BaseModel):
    """Input model for creating dataset recommendation"""
    control_id: str
    title: str
    description: str
    threshold_params: Dict[str, Any] = Field(default_factory=dict)
    risk_level: RiskLevel
    regulatory_reference: str


class CoverageMetrics(BaseModel):
    """Coverage metrics model"""
    id: str = Field(validation_alias="_id")
    company_id: str
    total_recommendations: int
    implemented_controls: int
    coverage_percent: float
    last_updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class ViolationExplanation(BaseModel):
    """Explainability model for violations"""
    rule_summary: str
    dataset_mapping: Optional[Dict[str, str]] = None
    reasons: list[str] = Field(default_factory=list)
    threshold_info: Optional[Dict[str, Any]] = None


class SimulationResult(BaseModel):
    """Rule simulation result"""
    violations_before: int
    violations_after: int
    change: int
    change_percent: float
    breakdown_before: Dict[str, int]
    breakdown_after: Dict[str, int]
    accounts_affected_before: int
    accounts_affected_after: int
