"""
PolicyGuard FastAPI Application
Main entry point for the backend API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import connect_to_mongo, close_mongo_connection
from app.routes import (
    policies, rules, scans, violations, test_llm, dashboard, 
    auth, accounts, cases, analytics, data_import, dataset, ml
)
from app.routes import settings as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="PolicyGuard API",
    description="Policy compliance scanning system with LLM-powered rule generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
from app.config import settings
allowed_origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(rules.router, prefix="/rules", tags=["Rules"])
app.include_router(scans.router, prefix="/scans", tags=["Scans"])
app.include_router(violations.router, prefix="/violations", tags=["Violations"])
app.include_router(cases.router, prefix="/cases", tags=["Cases"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(accounts.router, tags=["Accounts"])
app.include_router(settings_router.router, tags=["Settings"])
app.include_router(data_import.router, prefix="/data", tags=["Data Import"])
app.include_router(dataset.router, prefix="/dataset", tags=["Dataset Recommendations"])
app.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])
app.include_router(test_llm.router, prefix="/test-llm", tags=["LLM Testing"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "PolicyGuard API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check with actual MongoDB connectivity test"""
    from app.db import get_database
    try:
        db = get_database()
        await db.command('ping')
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
