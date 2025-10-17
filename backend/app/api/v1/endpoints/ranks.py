from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user, get_admin_user
from app.models.user import User
from app.models.bonus import Bonus, BonusType
from app.models.rank import Rank
from app.schemas.rank import RankResponse, RankProgress, RankHistory
from app.services.rank_service import (
    get_all_ranks, get_rank_progress, calculate_user_rank
)
from app.services.config_service import get_config
from app.utils.activity import log_activity
import json

class RankUpdate(BaseModel):
    name: str
    team_turnover_required: float
    first_leg_requirement: float
    second_leg_requirement: float
    other_legs_requirement: float

class BulkRankUpdate(BaseModel):
    ranks: List[RankUpdate]

router = APIRouter()

@router.get("/", response_model=List[RankResponse])
def get_ranks(db: Session = Depends(get_db)):
    """Get all available ranks with bonus amounts from config"""
    ranks = get_all_ranks(db)
    
    # Get rank bonus amounts from config
    rank_bonus_config = get_config(db, "rank_bonus_amounts")
    rank_bonus_amounts = json.loads(rank_bonus_config) if rank_bonus_config else {}
    
    # Override bonus amounts from config
    for rank in ranks:
        if rank.name in rank_bonus_amounts:
            rank.bonus_amount = rank_bonus_amounts[rank.name]
        else:
            rank.bonus_amount = 0
    
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

@router.put("/bulk-update")
def bulk_update_ranks(
    data: BulkRankUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Bulk update rank requirements"""
    updated_count = 0
    
    for rank_update in data.ranks:
        rank = db.query(Rank).filter(Rank.name == rank_update.name).first()
        if rank:
            rank.team_turnover_required = rank_update.team_turnover_required
            rank.first_leg_requirement = rank_update.first_leg_requirement
            rank.second_leg_requirement = rank_update.second_leg_requirement
            rank.other_legs_requirement = rank_update.other_legs_requirement
            updated_count += 1
    
    db.commit()
    log_activity(db, admin.id, "rank_requirements_updated", details={"count": updated_count})
    
    return {"message": f"Updated {updated_count} ranks successfully"}
