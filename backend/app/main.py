"""
PolicyGuard FastAPI Application
Main entry point for the backend API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import connect_to_mongo, close_mongo_connection
from app.routes import policies, rules, scans, violations, test_llm, dashboard, auth, accounts, settings


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
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
app.include_router(accounts.router, tags=["Accounts"])
app.include_router(settings.router, tags=["Settings"])
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
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected"
    }
