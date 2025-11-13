from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.team import TeamMember
from app.schemas.user import UserResponse
from app.utils.activity import log_activity
from app.core.security import get_password_hash
from app.core.rbac import has_role
import secrets

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

class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    package_id: Optional[int] = None
    role_ids: Optional[List[int]] = None

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    package_id: Optional[int] = None
    role_ids: Optional[List[int]] = None

@router.post("/users", response_model=UserResponse)
def admin_create_user(
    user_data: AdminUserCreate,
    admin: User = Depends(require_permission("users:create")),
    db: Session = Depends(get_db)
):
    """Admin: Create a new user without referral requirement"""
    from app.models.role import Role
    from app.models.user_role import UserRole
    
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Prevent non-superadmin from creating superadmin users
    if user_data.role_ids:
        for role_id in user_data.role_ids:
            role = db.query(Role).filter(Role.id == role_id).first()
            if role and role.name == "super_admin" and not has_role(db, admin, "super_admin"):
                raise HTTPException(status_code=403, detail="Only super admins can assign super admin role")
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        referral_code=secrets.token_urlsafe(8),
        is_verified=True,  # Always verified for admin-created users
        is_active=True,  # Always active for admin-created users
        sponsor_id=None  # No sponsor required for admin-created users
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create team relationships (closure table)
    team_self = TeamMember(user_id=user.id, ancestor_id=user.id, depth=0, path=str(user.id))
    db.add(team_self)
    
    # Assign activation package if provided
    if user_data.package_id:
        from app.models.activation import ActivationPackage, UserActivation
        
        package = db.query(ActivationPackage).filter(ActivationPackage.id == user_data.package_id).first()
        if package:
            activation = UserActivation(
                user_id=user.id,
                package_id=package.id,
                amount_paid=package.price,
                payment_method="admin_assigned",
                payment_status="completed",
                activated_at=datetime.utcnow()
            )
            db.add(activation)
    
    # Assign roles if provided
    if user_data.role_ids:
        for role_id in user_data.role_ids:
            role = db.query(Role).filter(Role.id == role_id, Role.is_active == True).first()
            if role:
                user_role = UserRole(
                    user_id=user.id,
                    role_id=role_id,
                    assigned_by=admin.id
                )
                db.add(user_role)
    
    db.commit()
    
    # Log activity
    log_activity(
        db, user.id, "admin_created_user",
        details={
            "admin_id": admin.id,
            "admin_email": admin.email,
            "created_user_email": user.email,
            "assigned_roles": user_data.role_ids
        }
    )
    
    return user

@router.get("/users", response_model=List[UserResponse])
def admin_list_users(
    search: Optional[str] = None,
    rank: Optional[str] = None,
    is_verified: Optional[bool] = None,
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_permission("users:list")),
    db: Session = Depends(get_db)
):
    """Admin: List all users with filters"""
    from app.models.role import Role
    from app.models.user_role import UserRole
    
    query = db.query(User)
    
    # Filter out super_admin users if current user is not super_admin
    if not has_role(db, admin, "super_admin"):
        # Get all super_admin role IDs
        super_admin_roles = db.query(Role.id).filter(Role.name == "super_admin").all()
        super_admin_role_ids = [r[0] for r in super_admin_roles]
        
        if super_admin_role_ids:
            # Get user IDs with super_admin role
            super_admin_user_ids = db.query(UserRole.user_id).filter(
                UserRole.role_id.in_(super_admin_role_ids)
            ).all()
            super_admin_user_ids = [u[0] for u in super_admin_user_ids]
            
            # Exclude those users
            if super_admin_user_ids:
                query = query.filter(~User.id.in_(super_admin_user_ids))
    
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
    
    # Note: role filter removed as User model doesn't have a role field
    # Role filtering should be done through RBAC system if needed
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add sponsor referral code to each user
    for user in users:
        if user.sponsor_id:
            sponsor = db.query(User).filter(User.id == user.sponsor_id).first()
            if sponsor:
                user.sponsor_referral_code = sponsor.referral_code
    
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
def admin_get_user(
    user_id: int,
    admin: User = Depends(require_permission("users:list")),
    db: Session = Depends(get_db)
):
    """Admin: Get user details"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    admin: User = Depends(require_permission("users:update")),
    db: Session = Depends(get_db)
):
    """Admin: Update user details"""
    from app.models.role import Role
    from app.models.user_role import UserRole
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent editing yourself
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot edit your own account through this endpoint")
    
    # Check if email is being changed and if it's already taken
    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_data.email
    
    # Update basic fields
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.phone_number is not None:
        user.phone_number = user_data.phone_number
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    if user_data.is_verified is not None:
        user.is_verified = user_data.is_verified
    if user_data.password:
        user.hashed_password = get_password_hash(user_data.password)
    
    # Update roles if provided
    if user_data.role_ids is not None:
        # Prevent non-superadmin from assigning super_admin role
        if not has_role(db, admin, "super_admin"):
            for role_id in user_data.role_ids:
                role = db.query(Role).filter(Role.id == role_id).first()
                if role and role.name == "super_admin":
                    raise HTTPException(status_code=403, detail="Only super admins can assign super admin role")
        
        # Remove existing roles
        db.query(UserRole).filter(UserRole.user_id == user_id).delete()
        
        # Assign new roles
        for role_id in user_data.role_ids:
            role = db.query(Role).filter(Role.id == role_id, Role.is_active == True).first()
            if role:
                user_role = UserRole(
                    user_id=user_id,
                    role_id=role_id,
                    assigned_by=admin.id
                )
                db.add(user_role)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    # Log activity
    log_activity(
        db, user.id, "admin_updated_user",
        details={
            "admin_id": admin.id,
            "admin_email": admin.email,
            "updated_fields": user_data.dict(exclude_unset=True)
        }
    )
    
    return user

@router.post("/users/{user_id}/verify")
def admin_verify_user(
    user_id: int,
    admin: User = Depends(require_permission("users:list")),
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

@router.post("/users/{user_id}/verify-kyc")
def admin_verify_user_kyc(
    user_id: int,
    admin: User = Depends(require_permission("users:list")),
    db: Session = Depends(get_db)
):
    """Admin: Manually verify user KYC"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.kyc_verified = True
    user.kyc_verified_at = datetime.utcnow()
    db.commit()
    
    log_activity(
        db, user.id, "admin_kyc_verified",
        details={"admin_id": admin.id, "admin_email": admin.email}
    )
    
    return {"message": "User KYC verified successfully"}

@router.post("/users/{user_id}/suspend")
def admin_suspend_user(
    user_id: int,
    reason: str,
    admin: User = Depends(require_permission("users:list")),
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
    admin: User = Depends(require_permission("users:list")),
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
    admin: User = Depends(require_permission("users:list")),
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
    admin: User = Depends(require_permission("users:list")),
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
    admin: User = Depends(require_permission("users:list")),
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
    admin: User = Depends(require_permission("users:list")),
    db: Session = Depends(get_db)
):
    """Admin: Get all verification requests"""
    from app.models.verification import UserVerification
    verifications = db.query(UserVerification).order_by(UserVerification.created_at.desc()).all()
    return verifications


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    admin: User = Depends(require_permission("users:delete")),
    db: Session = Depends(get_db)
):
    """Admin: Delete user account"""
    from sqlalchemy import text
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Log the deletion before deleting
    log_activity(
        db, user.id, "admin_deleted_user",
        details={
            "admin_id": admin.id,
            "admin_email": admin.email,
            "deleted_user_email": user.email,
            "deleted_user_name": user.full_name
        }
    )
    
    try:
        # Use raw SQL to delete to avoid relationship loading issues
        
        # Delete activity logs first (foreign key constraint)
        db.execute(text("DELETE FROM activity_logs WHERE user_id = :user_id"), {"user_id": user_id})
        
        # Delete team relationships
        db.execute(
            text("DELETE FROM team_members WHERE user_id = :user_id OR ancestor_id = :user_id"),
            {"user_id": user_id}
        )
        
        # Delete user roles and permissions (if tables exist)
        try:
            db.execute(text("DELETE FROM user_roles WHERE user_id = :user_id"), {"user_id": user_id})
        except:
            pass
        
        try:
            db.execute(text("DELETE FROM user_permissions WHERE user_id = :user_id"), {"user_id": user_id})
        except:
            pass
        
        # Delete other related records that might have foreign keys
        try:
            db.execute(text("DELETE FROM support_tickets WHERE user_id = :user_id"), {"user_id": user_id})
        except:
            pass
        
        try:
            db.execute(text("DELETE FROM user_activations WHERE user_id = :user_id"), {"user_id": user_id})
        except:
            pass
        
        # Note: We keep transactions, bonuses, and payouts for audit trail
        # If you want to delete them, uncomment these:
        # db.execute(text("DELETE FROM transactions WHERE user_id = :user_id"), {"user_id": user_id})
        # db.execute(text("DELETE FROM bonuses WHERE user_id = :user_id"), {"user_id": user_id})
        # db.execute(text("DELETE FROM payouts WHERE user_id = :user_id"), {"user_id": user_id})
        
        # Delete the user directly with SQL to avoid relationship loading
        db.execute(text("DELETE FROM users WHERE id = :user_id"), {"user_id": user_id})
        
        db.commit()
        
        return {"message": "User deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to delete user: {str(e)}"
        )
