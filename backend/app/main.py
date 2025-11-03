from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1.router import api_router
from app.core.storage import UPLOAD_DIR, ENVIRONMENT, STORAGE_PATH
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}  # Hide schemas section
)

# Log configuration on startup
logger.info("="*60)
logger.info(f"Application Starting...")
logger.info(f"ENVIRONMENT: {ENVIRONMENT}")
logger.info(f"STORAGE_PATH: {STORAGE_PATH}")
logger.info(f"UPLOAD_DIR: {UPLOAD_DIR}")
logger.info(f"APP_NAME: {settings.APP_NAME}")
logger.info("="*60)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "https://restempire.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "message": settings.APP_NAME,
        "status": "running",
        "environment": ENVIRONMENT,
        "storage_path": STORAGE_PATH
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
