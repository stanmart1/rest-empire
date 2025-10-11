from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Email
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""
    MAIL_TLS: bool = True
    RESEND_API_KEY: str = ""
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:8080"
    
    # Payment Gateways - GTPay
    GTPAY_MERCHANT_ID: str = ""
    GTPAY_API_KEY: str = ""
    GTPAY_HASH_KEY: str = ""
    GTPAY_GATEWAY_URL: str = "https://gtweb.gtbank.com/GTPay/Tranx.aspx"
    
    # Payment Gateways - Providus Bank
    PROVIDUS_MERCHANT_ID: str = ""
    PROVIDUS_API_KEY: str = ""
    PROVIDUS_ACCOUNT_NUMBER: str = ""
    PROVIDUS_API_URL: str = "https://api.providusbank.com"
    
    # Crypto
    CRYPTO_WALLET_ADDRESS: str = ""
    CRYPTO_API_KEY: str = ""
    CRYPTO_NETWORK: str = "TRC20"
    
    # Bank Transfer
    BANK_NAME: str = "Providus Bank"
    BANK_ACCOUNT_NUMBER: str = ""
    BANK_ACCOUNT_NAME: str = "Rest Empire"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Application
    APP_NAME: str = "Rest Empire API"
    DEBUG_MODE: bool = False
    CORS_ORIGINS: List[str] = ["http://localhost:8080"]
    API_V1_PREFIX: str = "/api/v1"
    
    class Config:
        env_file = ".env"

settings = Settings()
