from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, generate_verification_token, generate_reset_token
)
from app.models.user import User
from app.models.team import TeamMember
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token, TokenRefresh,
    EmailVerification, PasswordResetRequest, PasswordReset
)
from app.services.email_service import send_verification_email, send_password_reset_email, send_welcome_email
from app.utils.activity import log_activity
from app.services.config_service import get_config
from jose import jwt, JWTError
from app.core.config import settings
import secrets

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if registration is enabled
    registration_enabled = (get_config(db, "registration_enabled") or "true") == "true"
    if not registration_enabled:
        raise HTTPException(status_code=403, detail="Registration is currently disabled")
    
    # Check email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Find sponsor if referral code provided
    sponsor = None
    if user_data.referral_code:
        sponsor = db.query(User).filter(User.referral_code == user_data.referral_code).first()
        if not sponsor:
            raise HTTPException(status_code=400, detail="Invalid referral code")
        if not sponsor.is_active:
            raise HTTPException(status_code=400, detail="Sponsor account is not active")
    else:
        # Use default sponsor if no referral code provided
        default_sponsor_id = get_config(db, "default_sponsor_id")
        if default_sponsor_id:
            sponsor = db.query(User).filter(User.id == int(default_sponsor_id)).first()
            if sponsor and not sponsor.is_active:
                sponsor = None  # Don't use inactive default sponsor
    
    # Check if activation packages are required
    activation_packages_enabled = (get_config(db, "activation_packages_enabled") or "true") == "true"
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        referral_code=secrets.token_urlsafe(8),
        is_verified=True,
        is_active=not activation_packages_enabled,  # Auto-activate if packages disabled
        sponsor_id=sponsor.id if sponsor else None
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create team relationships (closure table)
    team_self = TeamMember(user_id=user.id, ancestor_id=user.id, depth=0, path=str(user.id))
    db.add(team_self)
    
    if sponsor:
        sponsor_ancestors = db.query(TeamMember).filter(TeamMember.user_id == sponsor.id).all()
        for ancestor_rel in sponsor_ancestors:
            team_rel = TeamMember(
                user_id=user.id,
                ancestor_id=ancestor_rel.ancestor_id,
                depth=ancestor_rel.depth + 1,
                path=f"{ancestor_rel.path}.{user.id}"
            )
            db.add(team_rel)
    
    db.commit()
    
    # Log activity
    log_activity(
        db, user.id, "user_registered",
        details={"sponsor_id": sponsor.id if sponsor else None},
        ip_address=request.client.host
    )
    
    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        # Log failed attempt
        if user:
            log_activity(db, user.id, "login_failed", ip_address=request.client.host)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Return account status in token if inactive
    if not user.is_active:
        # Allow login but frontend should show payment required message
        pass
    
    # Log successful login
    log_activity(db, user.id, "login_success", ip_address=request.client.host)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)}, db=db)
    refresh_token = create_refresh_token(data={"sub": str(user.id)}, db=db)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token_data.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = int(payload.get("sub"))
        token_type: str = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    # Log token refresh
    log_activity(db, user.id, "token_refreshed")
    
    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)}, db=db)
    refresh_token = create_refresh_token(data={"sub": str(user.id)}, db=db)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/verify-email")
async def verify_email(verification: EmailVerification, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == verification.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    
    # Log verification
    log_activity(db, user.id, "email_verified")
    
    # Send welcome email
    await send_welcome_email(user.email, user.full_name or "User", db)
    
    return {"message": "Email verified successfully"}

@router.post("/request-password-reset")
async def request_password_reset(request_data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request_data.email).first()
    
    # Always return success to prevent email enumeration
    if user:
        reset_token = generate_reset_token()
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=2)
        db.commit()
        
        # Log password reset request
        log_activity(db, user.id, "password_reset_requested")
        
        # Send password reset email
        await send_password_reset_email(user.email, reset_token, db)
    
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(reset: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.password_reset_token == reset.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    
    if user.password_reset_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    user.hashed_password = get_password_hash(reset.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()
    
    # Log password reset
    log_activity(db, user.id, "password_reset_completed")
    
    return {"message": "Password reset successfully"}

@router.post("/resend-verification")
async def resend_verification(email_data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email_data.email).first()
    
    if not user:
        return {"message": "If the email exists, a verification link has been sent"}
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Generate new verification token
    verification_token = generate_verification_token()
    user.verification_token = verification_token
    db.commit()
    
    # Log resend verification
    log_activity(db, user.id, "verification_resent")
    
    # Send verification email
    await send_verification_email(user.email, verification_token, db)
    
    return {"message": "If the email exists, a verification link has been sent"}
