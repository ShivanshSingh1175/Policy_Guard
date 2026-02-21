"""
Authentication routes
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.models.user import (
    CompanyIn, CompanyOut, UserIn, UserOut, LoginRequest, LoginResponse, TokenData
)
from app.services.auth_service import (
    hash_password, verify_password, create_access_token, decode_access_token
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(authorization: Optional[str] = Header(None)) -> TokenData:
    """Dependency to get current authenticated user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return token_data


@router.post("/register-company", response_model=LoginResponse, status_code=201)
async def register_company(company_data: CompanyIn):
    """
    Register a new company with an admin user
    """
    db = get_database()
    
    # Check if company name already exists
    existing_company = await db.companies.find_one({"name": company_data.name})
    if existing_company:
        raise HTTPException(status_code=400, detail="Company name already exists")
    
    # Check if admin email already exists
    existing_user = await db.users.find_one({"email": company_data.admin_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create company
    company_doc = {
        "name": company_data.name,
        "industry": company_data.industry,
        "created_at": datetime.utcnow(),
        "user_count": 1
    }
    result = await db.companies.insert_one(company_doc)
    company_id = str(result.inserted_id)
    
    # Create admin user
    user_doc = {
        "email": company_data.admin_email,
        "password_hash": hash_password(company_data.admin_password),
        "name": company_data.admin_name,
        "role": "admin",
        "company_id": company_id,
        "created_at": datetime.utcnow(),
        "last_login": None
    }
    user_result = await db.users.insert_one(user_doc)
    user_id = str(user_result.inserted_id)
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user_id,
            "company_id": company_id,
            "role": "admin",
            "email": company_data.admin_email
        }
    )
    
    # Return login response
    user_out = UserOut(
        id=user_id,
        email=company_data.admin_email,
        name=company_data.admin_name,
        role="admin",
        company_id=company_id,
        company_name=company_data.name,
        created_at=user_doc["created_at"]
    )
    
    return LoginResponse(access_token=access_token, user=user_out)


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Login with email and password
    """
    db = get_database()
    
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Get company name
    company = await db.companies.find_one({"_id": ObjectId(user["company_id"])})
    company_name = company["name"] if company else None
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "company_id": user["company_id"],
            "role": user["role"],
            "email": user["email"]
        }
    )
    
    # Return login response
    user_out = UserOut(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=user["role"],
        company_id=user["company_id"],
        company_name=company_name,
        created_at=user["created_at"],
        last_login=user.get("last_login")
    )
    
    return LoginResponse(access_token=access_token, user=user_out)


@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """
    Get current user information
    """
    db = get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    company = await db.companies.find_one({"_id": ObjectId(current_user.company_id)})
    company_name = company["name"] if company else None
    
    return UserOut(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=user["role"],
        company_id=user["company_id"],
        company_name=company_name,
        created_at=user["created_at"],
        last_login=user.get("last_login")
    )


@router.post("/firebase-login", response_model=LoginResponse)
async def firebase_login(firebase_data: dict):
    """
    Login with Firebase authentication token
    """
    db = get_database()
    
    firebase_token = firebase_data.get("firebase_token")
    email = firebase_data.get("email")
    name = firebase_data.get("name")
    
    if not firebase_token or not email:
        raise HTTPException(status_code=400, detail="Firebase token and email required")
    
    # Note: In production, verify the Firebase token using Firebase Admin SDK
    # For now, we'll trust the token and create/login the user
    
    # Check if user exists
    user = await db.users.find_one({"email": email})
    
    if not user:
        # Create a new company and user for first-time Firebase login
        company_doc = {
            "name": f"{name}'s Company",
            "industry": "General",
            "created_at": datetime.utcnow(),
            "user_count": 1
        }
        company_result = await db.companies.insert_one(company_doc)
        company_id = str(company_result.inserted_id)
        
        # Create user
        user_doc = {
            "email": email,
            "password_hash": "",  # No password for Firebase users
            "name": name,
            "role": "admin",
            "company_id": company_id,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "auth_provider": "firebase"
        }
        user_result = await db.users.insert_one(user_doc)
        user_id = str(user_result.inserted_id)
        company_name = company_doc["name"]
    else:
        # Update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        user_id = str(user["_id"])
        company_id = user["company_id"]
        
        # Get company name
        company = await db.companies.find_one({"_id": ObjectId(company_id)})
        company_name = company["name"] if company else None
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user_id,
            "company_id": company_id,
            "role": user.get("role", "admin") if user else "admin",
            "email": email
        }
    )
    
    # Return login response
    user_out = UserOut(
        id=user_id,
        email=email,
        name=name,
        role=user.get("role", "admin") if user else "admin",
        company_id=company_id,
        company_name=company_name,
        created_at=user.get("created_at", datetime.utcnow()) if user else datetime.utcnow(),
        last_login=datetime.utcnow()
    )
    
    return LoginResponse(access_token=access_token, user=user_out)
