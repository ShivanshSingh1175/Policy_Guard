"""
ML model management and prediction endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.db import get_database
from app.ml.ml_service import MLService
from app.routes.auth import get_current_user, TokenData


router = APIRouter()


class TrainRequest(BaseModel):
    """Request to train ML model"""
    model_version: str
    contamination: float = 0.05
    n_estimators: int = 100


class PredictRequest(BaseModel):
    """Request for ML prediction"""
    transaction: Dict[str, Any]
    model_version: Optional[str] = None


@router.post("/train")
async def train_model(
    request: TrainRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Train anomaly detection model for company
    Requires admin role
    """
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_database()
    ml_service = MLService()
    
    result = await ml_service.train_model(
        db=db,
        company_id=current_user.company_id,
        model_version=request.model_version,
        contamination=request.contamination,
        n_estimators=request.n_estimators
    )
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error'))
    
    return result


@router.get("/models")
async def list_models(
    current_user: TokenData = Depends(get_current_user)
):
    """List all trained models for company"""
    db = get_database()
    
    models = await db.ml_models.find({
        'company_id': current_user.company_id
    }).sort('created_at', -1).to_list(length=100)
    
    for model in models:
        model['_id'] = str(model['_id'])
    
    return {
        'models': models,
        'count': len(models)
    }


@router.get("/models/{model_version}")
async def get_model_info(
    model_version: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get detailed model information"""
    db = get_database()
    ml_service = MLService()
    
    model_info = await ml_service.get_model_info(
        db=db,
        company_id=current_user.company_id,
        model_version=model_version
    )
    
    if not model_info:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return model_info


@router.post("/predict")
async def predict_transaction(
    request: PredictRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get ML prediction for a transaction
    """
    db = get_database()
    ml_service = MLService()
    
    # Add company_id to transaction
    request.transaction['company_id'] = current_user.company_id
    
    result = await ml_service.predict(
        db=db,
        transaction=request.transaction,
        company_id=current_user.company_id,
        model_version=request.model_version
    )
    
    return result


@router.get("/status")
async def get_ml_status(
    current_user: TokenData = Depends(get_current_user)
):
    """Get ML system status for company"""
    db = get_database()
    
    # Count models
    model_count = await db.ml_models.count_documents({
        'company_id': current_user.company_id,
        'status': 'trained'
    })
    
    # Get latest model
    latest_model = await db.ml_models.find_one(
        {'company_id': current_user.company_id, 'status': 'trained'},
        sort=[('created_at', -1)]
    )
    
    # Count transactions
    tx_count = await db.transactions.count_documents({
        'company_id': current_user.company_id
    })
    
    return {
        'models_trained': model_count,
        'latest_model': latest_model.get('model_version') if latest_model else None,
        'latest_model_date': latest_model.get('created_at') if latest_model else None,
        'transactions_available': tx_count,
        'ml_enabled': model_count > 0
    }
