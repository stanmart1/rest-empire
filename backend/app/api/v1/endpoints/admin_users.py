from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User, UserRole
from app.schemas.user import UserResponse
from app.utils.activity import log_activity
from app.core.security import get_password_hash

router = APIRouter()

class UserSearch(BaseModel):
    query: Optional[str] = None
    rank: Optional[str] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = None
    role: Optional[str] = None

class BalanceAdjustment(BaseModel):
    amount: float
    currency: str
    reason: str

class RankChange(BaseModel):
    new_rank: str
    reason: str

@router.get("/users", response_model=List[UserResponse])
def admin_list_users(
    search: Optional[str] = None,
    rank: Optional[str] = None,
    is_verified: Optional[bool] = None,
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: List all users with filters"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%"),
                User.referral_code.ilike(f"%{search}%")
            )
        )
    
    if rank:
        query = query.filter(User.current_rank == rank)
    
    if is_verified is not None:
        query = query.filter(User.is_verified == is_verified)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
def admin_get_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get user details"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post("/users/{user_id}/verify")
def admin_verify_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Manually verify user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    
    log_activity(
        db, user.id, "admin_verified",
        details={"admin_id": admin.id, "admin_email": admin.email}
    )
    
    return {"message": "User verified successfully"}

@router.post("/users/{user_id}/suspend")
def admin_suspend_user(
    user_id: int,
    reason: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Suspend user account"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    log_activity(
        db, user.id, "admin_suspended",
        details={"admin_id": admin.id, "reason": reason}
    )
    
    return {"message": "User suspended successfully"}

@router.post("/users/{user_id}/unsuspend")
def admin_unsuspend_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Unsuspend user account"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    
    log_activity(
        db, user.id, "admin_unsuspended",
        details={"admin_id": admin.id}
    )
    
    return {"message": "User unsuspended successfully"}

@router.post("/users/{user_id}/adjust-balance")
def admin_adjust_balance(
    user_id: int,
    adjustment: BalanceAdjustment,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Adjust user balance"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if adjustment.currency == "NGN":
        old_balance = float(user.balance_ngn)
        user.balance_ngn += adjustment.amount
        new_balance = float(user.balance_ngn)
    elif adjustment.currency == "USDT":
        old_balance = float(user.balance_usdt)
        user.balance_usdt += adjustment.amount
        new_balance = float(user.balance_usdt)
    else:
        raise HTTPException(status_code=400, detail="Invalid currency")
    
    db.commit()
    
    log_activity(
        db, user.id, "admin_balance_adjusted",
        details={
            "admin_id": admin.id,
            "currency": adjustment.currency,
            "amount": adjustment.amount,
            "old_balance": old_balance,
            "new_balance": new_balance,
            "reason": adjustment.reason
        }
    )
    
    return {"message": "Balance adjusted successfully", "new_balance": new_balance}

@router.post("/users/{user_id}/change-rank")
def admin_change_rank(
    user_id: int,
    rank_change: RankChange,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Manually change user rank"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_rank = user.current_rank
    user.current_rank = rank_change.new_rank
    user.rank_achieved_date = datetime.utcnow()
    db.commit()
    
    log_activity(
        db, user.id, "admin_rank_changed",
        details={
            "admin_id": admin.id,
            "old_rank": old_rank,
            "new_rank": rank_change.new_rank,
            "reason": rank_change.reason
        }
    )
    
    return {"message": "Rank changed successfully"}

@router.get("/stats/overview")
def admin_get_overview_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get platform overview statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    
    from app.models.transaction import Transaction, TransactionStatus
    from app.models.payout import Payout, PayoutStatus
    from app.models.bonus import Bonus, BonusStatus
    
    total_transactions = db.query(func.sum(Transaction.amount)).filter(
        Transaction.status == TransactionStatus.completed
    ).scalar() or 0
    
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status.in_([PayoutStatus.pending, PayoutStatus.approved])
    ).scalar() or 0
    
    total_bonuses = db.query(func.sum(Bonus.amount)).filter(
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "verified_users": verified_users,
        "total_revenue": float(total_transactions),
        "pending_payouts": float(pending_payouts),
        "total_bonuses_paid": float(total_bonuses)
    }

@router.get("/verifications")
def admin_get_verifications(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all verification requests"""
    from app.models.verification import UserVerification
    verifications = db.query(UserVerification).order_by(UserVerification.created_at.desc()).all()
    return verifications
