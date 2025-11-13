from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.core.rbac import has_permission, has_any_permission, has_role

security = HTTPBearer(auto_error=False)

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from cookie or Authorization header"""
    token = None
    
    # Try to get token from cookie first
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization header for backward compatibility
    if not token and credentials:
        token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = int(payload.get("sub"))
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def get_admin_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Require admin role using RBAC"""
    if has_role(db, current_user, 'super_admin'):
        return current_user
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required"
    )

def require_permission(permission: str):
    """Dependency factory to require a specific permission"""
    def _check_permission(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        if not has_permission(db, current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission} required"
            )
        return current_user
    return _check_permission

def require_any_permission(permissions: List[str]):
    """Dependency factory to require any of the specified permissions"""
    def _check_permissions(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        if not has_any_permission(db, current_user, permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: One of {permissions} required"
            )
        return current_user
    return _check_permissions

def require_role(role_name: str):
    """Dependency factory to require a specific role"""
    def _check_role(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        if not has_role(db, current_user, role_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role required: {role_name}"
            )
        return current_user
    return _check_role

def check_feature_access(feature_name: str):
    """Check if user has access to a specific feature"""
    def _check_access(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        from app.models.activation import UserActivation, ActivationPackage
        from datetime import datetime
        from app.services.config_service import get_config
        
        # Check if activation packages are enabled
        activation_packages_enabled = (get_config(db, "activation_packages_enabled") or "true") == "true"
        
        if not activation_packages_enabled:
            # If activation packages are disabled, just check if user is active
            if not current_user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Please activate your account to access this feature"
                )
            return current_user
        
        # Check if user is active
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please activate your account to access this feature"
            )
        
        # Get user's activation
        activation = db.query(UserActivation).filter(
            UserActivation.user_id == current_user.id
        ).first()
        
        if not activation or activation.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please activate your account to access this feature"
            )
        
        # Check if activation has expired
        if activation.expires_at and datetime.utcnow() > activation.expires_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your subscription has expired. Please renew to access this feature"
            )
        
        # Check if package includes this feature
        if activation.package_id:
            package = db.query(ActivationPackage).filter(
                ActivationPackage.id == activation.package_id
            ).first()
            
            if package and package.allowed_features:
                if feature_name not in package.allowed_features:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Your package does not include access to {feature_name.replace('_', ' ')}. Please upgrade your package"
                    )
        
        return current_user
    
    return _check_access
