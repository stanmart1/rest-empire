from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.team import TeamMember
from app.models.transaction import Transaction, TransactionStatus
from app.models.bonus import Bonus, BonusStatus
from app.models.payout import Payout, PayoutStatus
from app.schemas.user import UserResponse, PasswordChange
from app.schemas.profile import ProfileUpdate, EmailChange, DashboardStats, ReferralInfo, SponsorInfo
from app.core.security import verify_password, get_password_hash, generate_verification_token
from app.services.email_service import send_verification_email
from app.utils.activity import log_activity
from app.core.config import settings

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    if profile_data.phone_number is not None:
        current_user.phone_number = profile_data.phone_number
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    log_activity(db, current_user.id, "profile_updated", ip_address=request.client.host if request else None)
    
    return current_user

@router.post("/change-email")
async def change_email(
    email_data: EmailChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    # Verify password
    if not verify_password(email_data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    # Check new email not already in use
    if db.query(User).filter(User.email == email_data.new_email, User.id != current_user.id).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    
    # Generate verification token for new email
    verification_token = generate_verification_token()
    
    old_email = current_user.email
    current_user.email = email_data.new_email
    current_user.is_verified = False
    current_user.verification_token = verification_token
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    log_activity(
        db, current_user.id, "email_changed",
        details={"old_email": old_email, "new_email": email_data.new_email},
        ip_address=request.client.host if request else None
    )
    
    # Send verification email to new address
    await send_verification_email(email_data.new_email, verification_token)
    
    return {"message": "Email updated. Please verify your new email address."}

@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Check new password is different
    if password_data.current_password == password_data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    log_activity(db, current_user.id, "password_changed", ip_address=request.client.host if request else None)
    
    return {"message": "Password changed successfully"}

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get team size
    team_size = db.query(TeamMember).filter(
        TeamMember.ancestor_id == current_user.id,
        TeamMember.depth > 0
    ).count()
    
    # Get first line count
    first_line_count = db.query(TeamMember).filter(
        TeamMember.ancestor_id == current_user.id,
        TeamMember.depth == 1
    ).count()
    
    # Get pending payouts
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.user_id == current_user.id,
        Payout.status == PayoutStatus.pending
    ).scalar() or 0
    
    # Get recent earnings (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_earnings = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.status == BonusStatus.paid,
        Bonus.created_at >= thirty_days_ago
    ).scalar() or 0
    
    return DashboardStats(
        balance_eur=float(current_user.balance_eur),
        balance_dbsp=float(current_user.balance_dbsp),
        total_earnings=float(current_user.total_earnings),
        current_rank=current_user.current_rank,
        team_size=team_size,
        first_line_count=first_line_count,
        pending_payouts=float(pending_payouts),
        recent_earnings_30d=float(recent_earnings)
    )

@router.get("/referral", response_model=ReferralInfo)
def get_referral_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get total referrals (direct downline)
    total_referrals = db.query(User).filter(User.sponsor_id == current_user.id).count()
    
    # Get active referrals
    active_referrals = db.query(User).filter(
        User.sponsor_id == current_user.id,
        User.is_active == True,
        User.is_verified == True
    ).count()
    
    referral_url = f"{settings.FRONTEND_URL}/register?ref={current_user.referral_code}"
    
    return ReferralInfo(
        referral_code=current_user.referral_code,
        referral_url=referral_url,
        total_referrals=total_referrals,
        active_referrals=active_referrals
    )

@router.get("/sponsor", response_model=SponsorInfo)
def get_sponsor_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.sponsor_id:
        raise HTTPException(status_code=404, detail="No sponsor found")
    
    sponsor = db.query(User).filter(User.id == current_user.sponsor_id).first()
    
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    return sponsor
