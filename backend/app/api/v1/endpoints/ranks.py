from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.bonus import Bonus, BonusType
from app.schemas.rank import RankResponse, RankProgress, RankHistory
from app.services.rank_service import (
    get_all_ranks, get_rank_progress, calculate_user_rank
)

router = APIRouter()

@router.get("/", response_model=List[RankResponse])
def get_ranks(db: Session = Depends(get_db)):
    """Get all available ranks"""
    ranks = get_all_ranks(db)
    return ranks

@router.get("/progress/", response_model=RankProgress)
def get_user_rank_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's rank progress"""
    from app.models.rank import Rank
    from fastapi import HTTPException
    
    progress = get_rank_progress(db, current_user.id)
    
    if not progress:
        raise HTTPException(status_code=404, detail="Rank progress not found")
    
    # Get rank objects
    current_rank_obj = db.query(Rank).filter(Rank.name == progress["current_rank"]).first()
    next_rank_obj = db.query(Rank).filter(Rank.name == progress.get("next_rank")).first() if progress.get("next_rank") else None
    
    if not current_rank_obj:
        raise HTTPException(status_code=404, detail="Current rank not found")
    
    return RankProgress(
        current_rank=current_rank_obj,
        next_rank=next_rank_obj,
        total_turnover=progress.get("total_turnover", 0),
        first_leg_turnover=progress.get("first_leg_turnover", 0),
        first_leg_progress=progress.get("first_leg_progress", 0),
        second_leg_turnover=progress.get("second_leg_turnover", 0),
        second_leg_progress=progress.get("second_leg_progress", 0),
        other_legs_turnover=progress.get("other_legs_turnover", 0),
        other_legs_progress=progress.get("other_legs_progress", 0),
        overall_progress=progress.get("overall_progress", 0),
        requirements_met=progress.get("requirements_met", {})
    )

@router.get("/history", response_model=List[RankHistory])
def get_rank_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's rank achievement history"""
    # Get all rank bonuses (indicates rank achievements)
    rank_bonuses = db.query(Bonus).filter(
        Bonus.user_id == current_user.id,
        Bonus.bonus_type == BonusType.rank_bonus
    ).order_by(Bonus.created_at).all()
    
    history = []
    for bonus in rank_bonuses:
        history.append(RankHistory(
            rank_name=bonus.rank_achieved,
            achieved_date=bonus.created_at,
            bonus_earned=float(bonus.amount)
        ))
    
    return history

@router.post("/recalculate")
def recalculate_rank(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger rank recalculation"""
    rank_changed = calculate_user_rank(db, current_user.id)
    
    if rank_changed:
        db.refresh(current_user)
        return {
            "message": "Rank updated successfully",
            "new_rank": current_user.current_rank
        }
    else:
        return {
            "message": "No rank change",
            "current_rank": current_user.current_rank
        }
