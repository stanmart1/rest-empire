from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
from app.core.config import settings
from app.services.config_service import get_config
import secrets
from fastapi import Response

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None, db=None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Get from database only
        minutes = int(get_config(db, "access_token_expire_minutes") or "30")
        expire = datetime.utcnow() + timedelta(minutes=minutes)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict, db=None) -> str:
    to_encode = data.copy()
    # Get from database only
    days = int(get_config(db, "refresh_token_expire_days") or "7")
    expire = datetime.utcnow() + timedelta(days=days)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise Exception(f"Invalid token: {str(e)}")

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str, secure: bool = False):
    """Set authentication tokens in httpOnly cookies"""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=1800  # 30 minutes
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=604800  # 7 days
    )

def clear_auth_cookies(response: Response):
    """Clear authentication cookies"""
    response.delete_cookie(key="access_token", samesite="lax")
    response.delete_cookie(key="refresh_token", samesite="lax")
