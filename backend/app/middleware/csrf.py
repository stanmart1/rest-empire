from fastapi import Request, HTTPException, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import secrets
import hmac
import hashlib
from app.core.config import settings

class CSRFMiddleware(BaseHTTPMiddleware):
    """CSRF protection middleware"""
    
    EXEMPT_METHODS = {'GET', 'HEAD', 'OPTIONS'}
    EXEMPT_PATHS = {'/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh', '/docs', '/redoc', '/openapi.json'}
    
    def generate_csrf_token(self) -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    def verify_csrf_token(self, token: str, cookie_token: str) -> bool:
        """Verify CSRF token matches cookie"""
        if not token or not cookie_token:
            return False
        return hmac.compare_digest(token, cookie_token)
    
    async def dispatch(self, request: Request, call_next):
        # Skip CSRF check for exempt methods
        if request.method in self.EXEMPT_METHODS:
            response = await call_next(request)
            
            # Set CSRF token cookie if not present
            if 'csrf_token' not in request.cookies:
                csrf_token = self.generate_csrf_token()
                response.set_cookie(
                    key='csrf_token',
                    value=csrf_token,
                    httponly=False,  # JavaScript needs to read this
                    secure=settings.ENVIRONMENT == 'production',
                    samesite='lax',
                    max_age=86400  # 24 hours
                )
            
            return response
        
        # Skip CSRF check for exempt paths
        if request.url.path in self.EXEMPT_PATHS or request.url.path.startswith('/uploads'):
            return await call_next(request)
        
        # Get CSRF token from header and cookie
        csrf_token_header = request.headers.get('X-CSRF-Token')
        csrf_token_cookie = request.cookies.get('csrf_token')
        
        # Verify CSRF token
        if not self.verify_csrf_token(csrf_token_header, csrf_token_cookie):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token validation failed. Please refresh the page and try again."
            )
        
        response = await call_next(request)
        return response
