from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.api.v1.router import api_router
from app.core.storage import UPLOAD_DIR, ENVIRONMENT, STORAGE_PATH
from app.middleware.csrf import CSRFMiddleware
import logging

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}  # Hide schemas section
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Log configuration on startup
logger.info("="*60)
logger.info(f"Application Starting...")
logger.info(f"ENVIRONMENT: {ENVIRONMENT}")
logger.info(f"STORAGE_PATH: {STORAGE_PATH}")
logger.info(f"UPLOAD_DIR: {UPLOAD_DIR}")
logger.info(f"APP_NAME: {settings.APP_NAME}")
logger.info("="*60)

# CORS - Dynamic based on environment
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:5173",
]

if ENVIRONMENT == "production":
    allowed_origins.extend([
        "https://restempire.com",
        "https://www.restempire.com",
        "https://api.restempire.com",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "X-CSRF-Token"],
)

# Add CSRF protection
app.add_middleware(CSRFMiddleware)

# Mount static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "message": settings.APP_NAME,
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
