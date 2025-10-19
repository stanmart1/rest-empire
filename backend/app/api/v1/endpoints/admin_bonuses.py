from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.bonus import BonusResponse
from app.utils.activity import log_activity

router = APIRouter()

class ManualBonus(BaseModel):
    user_id: int
    amount: float
    currency: str = "NGN"
    bonus_type: str = "direct"
    description: str

@router.get("/bonuses", response_model=List[BonusResponse])
def admin_get_all_bonuses(
    user_id: Optional[int] = None,
    bonus_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_permission("bonuses:view_list")),
    db: Session = Depends(get_db)
):
    """Admin: Get all bonuses with filters"""
    query = db.query(Bonus)
    
    if user_id:
        query = query.filter(Bonus.user_id == user_id)
    
    if bonus_type:
        query = query.filter(Bonus.bonus_type == bonus_type)
    
    if status:
        query = query.filter(Bonus.status == status)
    
    bonuses = query.order_by(Bonus.created_at.desc()).offset(skip).limit(limit).all()
    
    return bonuses

@router.post("/bonuses/manual")
def admin_create_manual_bonus(
    bonus: ManualBonus,
    admin: User = Depends(require_permission("bonuses:view_list")),
    db: Session = Depends(get_db)
):
    """Admin: Create manual bonus"""
    user = db.query(User).filter(User.id == bonus.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create bonus
    new_bonus = Bonus(
        user_id=bonus.user_id,
        bonus_type=BonusType[bonus.bonus_type],
        amount=bonus.amount,
        currency=bonus.currency,
        status=BonusStatus.paid,
        paid_date=datetime.utcnow().date()
    )
    db.add(new_bonus)
    
    # Create transaction
    transaction = Transaction(
        user_id=bonus.user_id,
        transaction_type=TransactionType.bonus,
        amount=bonus.amount,
        currency=bonus.currency,
        status=TransactionStatus.completed,
        description=bonus.description,
        completed_at=datetime.utcnow(),
        meta_data={"created_by_admin": admin.id}
    )
    db.add(transaction)
    
    # Update balance
    if bonus.currency == "NGN":
        user.balance_ngn += bonus.amount
    elif bonus.currency == "USDT":
        user.balance_usdt += bonus.amount
    
    user.total_earnings += bonus.amount
    
    db.commit()
    
    log_activity(
        db, bonus.user_id, "admin_bonus_created",
        entity_type="bonus",
        entity_id=new_bonus.id,
        details={"admin_id": admin.id, "amount": bonus.amount}
    )
    
    return {"message": "Bonus created successfully", "bonus_id": new_bonus.id}

@router.get("/bonuses/analytics")
def admin_get_bonus_analytics(
    admin: User = Depends(require_permission("bonuses:view_list")),
    db: Session = Depends(get_db)
):
    """Admin: Get bonus analytics"""
    # Total bonuses by type
    bonuses_by_type = db.query(
        Bonus.bonus_type,
        func.sum(Bonus.amount).label('total'),
        func.count(Bonus.id).label('count')
    ).filter(
        Bonus.status == BonusStatus.paid
    ).group_by(Bonus.bonus_type).all()
    
    # Top earners
    top_earners = db.query(
        User.id,
        User.email,
        User.full_name,
        func.sum(Bonus.amount).label('total_bonuses')
    ).join(Bonus).filter(
        Bonus.status == BonusStatus.paid
    ).group_by(User.id).order_by(func.sum(Bonus.amount).desc()).limit(10).all()
    
    # Total bonuses paid
    total_paid = db.query(func.sum(Bonus.amount)).filter(
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    return {
        "total_bonuses_paid": float(total_paid),
        "bonuses_by_type": [
            {"type": str(b.bonus_type), "total": float(b.total), "count": b.count}
            for b in bonuses_by_type
        ],
        "top_earners": [
            {
                "user_id": e.id,
                "email": e.email,
                "name": e.full_name,
                "total_bonuses": float(e.total_bonuses)
            }
            for e in top_earners
        ]
    }
