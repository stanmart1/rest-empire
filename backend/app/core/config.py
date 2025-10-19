from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 30
    DATABASE_MAX_OVERFLOW: int = 10
    POOL_PRE_PING: bool = True
    POOL_RECYCLE: int = 1800  # 30 minutes
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    # Frontend
    FRONTEND_URL: str = "http://localhost:8080"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Application
    APP_NAME: str = "Rest Empire API"
    DEBUG_MODE: bool = False
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:8080"]
    API_V1_PREFIX: str = "/api/v1"

    # ✅ Pydantic v2 config style
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ✅ Handles Coolify env var format
    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if not v:
            return []
        if isinstance(v, str):
            # Split comma-separated values and trim spaces
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


settings = Settings()
