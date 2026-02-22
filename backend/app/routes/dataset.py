"""
Dataset recommendation endpoints
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.dataset import (
    DatasetRecommendation,
    DatasetRecommendationIn,
    CoverageMetrics,
    ViolationExplanation
)
from app.routes.auth import get_current_user, TokenData
from app.services.dataset_parser import get_sample_recommendations, parse_recommendations_from_json
from app.services.recommendation_mapper import map_recommendation_to_rule
from app.services.explainability_service import generate_violation_explanation
from app.services.coverage_service import compute_coverage_metrics

router = APIRouter()


@router.post("/import")
async def import_dataset_recommendations(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Import dataset recommendations from internal sample data
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Get sample recommendations
    sample_data = get_sample_recommendations()
    recommendations = parse_recommendations_from_json(sample_data)
    
    # Add company_id to each recommendation (or keep as None for global)
    for rec in recommendations:
        rec["company_id"] = None  # Global recommendations
    
    # Insert recommendations (skip duplicates)
    inserted_count = 0
    for rec in recommendations:
        existing = await db.dataset_recommendations.find_one({
            "control_id": rec["control_id"],
            "company_id": rec["company_id"]
        })
        
        if not existing:
            await db.dataset_recommendations.insert_one(rec)
            inserted_count += 1
    
    return {
        "message": f"Imported {inserted_count} dataset recommendations",
        "total_processed": len(recommendations),
        "skipped_duplicates": len(recommendations) - inserted_count
    }


@router.get("/recommendations", response_model=List[DatasetRecommendation])
async def list_recommendations(
    risk_level: Optional[str] = Query(None),
    implemented: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user)
):
    """
    List dataset recommendations with filters
    """
    db = get_database()
    company_id = current_user.company_id
    
    # Build query filter (global or company-specific)
    query_filter = {
        "$or": [
            {"company_id": company_id},
            {"company_id": None}
        ]
    }
    
    if risk_level:
        query_filter["risk_level"] = risk_level
    if implemented is not None:
        query_filter["implemented"] = implemented
    
    # Execute query
    cursor = db.dataset_recommendations.find(query_filter).sort("risk_level", -1).skip(offset).limit(limit)
    recommendations = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for rec in recommendations:
        rec["_id"] = str(rec["_id"])
    
    return [DatasetRecommendation(**rec) for rec in recommendations]


@router.get("/coverage", response_model=CoverageMetrics)
async def get_coverage_metrics(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get coverage metrics for current company
    """
    db = get_database()
    company_id = current_user.company_id
    
    metrics = await compute_coverage_metrics(db, company_id)
    
    # Store/update in coverage_metrics collection
    await db.coverage_metrics.update_one(
        {"company_id": company_id},
        {"$set": metrics},
        upsert=True
    )
    
    # Return with _id
    stored = await db.coverage_metrics.find_one({"company_id": company_id})
    stored["_id"] = str(stored["_id"])
    
    return CoverageMetrics(**stored)


@router.post("/recommendations/{recommendation_id}/implement")
async def implement_recommendation(
    recommendation_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Implement a dataset recommendation as a rule
    """
    db = get_database()
    company_id = current_user.company_id
    
    if not ObjectId.is_valid(recommendation_id):
        raise HTTPException(status_code=400, detail="Invalid recommendation ID")
    
    # Get recommendation
    recommendation = await db.dataset_recommendations.find_one({
        "_id": ObjectId(recommendation_id)
    })
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    if recommendation.get("implemented"):
        raise HTTPException(status_code=400, detail="Recommendation already implemented")
    
    # Map to rule
    rule_data = map_recommendation_to_rule(recommendation, company_id)
    
    # Insert rule
    result = await db.rules.insert_one(rule_data)
    rule_id = str(result.inserted_id)
    
    # Update recommendation
    await db.dataset_recommendations.update_one(
        {"_id": ObjectId(recommendation_id)},
        {
            "$set": {
                "implemented": True,
                "mapped_rule_id": rule_id,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Recommendation implemented as rule",
        "rule_id": rule_id,
        "recommendation_id": recommendation_id
    }


@router.get("/recommendations/{recommendation_id}", response_model=DatasetRecommendation)
async def get_recommendation(
    recommendation_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a specific recommendation
    """
    db = get_database()
    
    if not ObjectId.is_valid(recommendation_id):
        raise HTTPException(status_code=400, detail="Invalid recommendation ID")
    
    recommendation = await db.dataset_recommendations.find_one({
        "_id": ObjectId(recommendation_id)
    })
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    recommendation["_id"] = str(recommendation["_id"])
    return DatasetRecommendation(**recommendation)
