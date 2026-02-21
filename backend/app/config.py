"""
Configuration management using pydantic-settings
Loads environment variables from .env file
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # MongoDB Configuration
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "policyguard"
    
    # LLM Configuration (Google Gemini)
    GEMINI_API_KEY: str = "AIzaSyCt0mvrqZyqMbWgv1_ce0sIUyB-IjwYWNA"
    LLM_MODEL: str = "gemini-pro"
    LLM_TEMPERATURE: float = 0.7
    
    # Application Configuration
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 200
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
