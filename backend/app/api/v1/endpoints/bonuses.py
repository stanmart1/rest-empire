from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.schemas.bonus import BonusResponse, BonusSummary

router = APIRouter()

@router.get("/", response_model=List[BonusResponse])
def get_bonuses(
    bonus_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's bonus history"""
    query = db.query(Bonus).filter(Bonus.user_id == current_user.id)
    
    if bonus_type:
        query = query.filter(Bonus.bonus_type == bonus_type)
    
    if status:
        query = query.filter(Bonus.status == status)
    
    bonuses = query.order_by(Bonus.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add source user names
    for bonus in bonuses:
        if bonus.source_user_id:
            source_user = db.query(User).filter(User.id == bonus.source_user_id).first()
            bonus.source_user_name = source_user.full_name if source_user else None
    
    return bonuses

@router.get("/summary", response_model=BonusSummary)
def get_bonus_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bonus summary statistics"""
    # Total bonuses
    total = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    # By type
    unilevel = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.bonus_type == BonusType.unilevel,
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    rank = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.bonus_type == BonusType.rank_bonus,
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    infinity = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.bonus_type == BonusType.infinity,
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    # By status
    pending = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.status == BonusStatus.pending
    ).scalar() or 0
    
    paid = db.query(func.sum(Bonus.amount)).filter(
        Bonus.user_id == current_user.id,
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    return BonusSummary(
        total_bonuses=float(total),
        unilevel_bonuses=float(unilevel),
        rank_bonuses=float(rank),
        infinity_bonuses=float(infinity),
        pending_bonuses=float(pending),
        paid_bonuses=float(paid)
    )

@router.get("/{bonus_id}", response_model=BonusResponse)
def get_bonus_details(
    bonus_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific bonus"""
    bonus = db.query(Bonus).filter(
        Bonus.id == bonus_id,
        Bonus.user_id == current_user.id
    ).first()
    
    if not bonus:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Bonus not found")
    
    return bonus
