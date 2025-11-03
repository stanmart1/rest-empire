from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.rank import Rank
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.services.team_service import calculate_leg_breakdown, get_team_size
from app.utils.activity import log_activity
import asyncio

def get_rank_by_name(db: Session, rank_name: str) -> Rank:
    """Get rank by name"""
    return db.query(Rank).filter(Rank.name == rank_name).first()

def get_rank_by_level(db: Session, level: int) -> Rank:
    """Get rank by level"""
    return db.query(Rank).filter(Rank.level == level).first()

def get_all_ranks(db: Session):
    """Get all ranks ordered by level"""
    return db.query(Rank).order_by(Rank.level).all()

def check_rank_qualification(db: Session, user_id: int, rank: Rank) -> dict:
    """Check if user qualifies for a specific rank"""
    # Get leg breakdown
    breakdown = calculate_leg_breakdown(db, user_id)
    
    if not breakdown["first_leg"]:
        return {
            "qualified": False,
            "total_turnover": 0,
            "first_leg": 0,
            "second_leg": 0,
            "other_legs": 0
        }
    
    # Calculate totals
    total_turnover = sum(leg["turnover"] for leg in breakdown["all_legs"])
    first_leg_turnover = breakdown["first_leg"]["turnover"]
    second_leg_turnover = breakdown["second_leg"]["turnover"] if breakdown["second_leg"] else 0
    other_legs_turnover = breakdown["other_legs"]["turnover"]
    
    # Check requirements
    total_met = total_turnover >= float(rank.team_turnover_required)
    first_leg_met = first_leg_turnover >= float(getattr(rank, 'first_leg_requirement', 0) or 0)
    second_leg_met = second_leg_turnover >= float(getattr(rank, 'second_leg_requirement', 0) or 0)
    other_legs_met = other_legs_turnover >= float(getattr(rank, 'other_legs_requirement', 0) or 0)
    
    qualified = total_met and first_leg_met and second_leg_met and other_legs_met
    
    return {
        "qualified": qualified,
        "total_turnover": total_turnover,
        "first_leg": first_leg_turnover,
        "second_leg": second_leg_turnover,
        "other_legs": other_legs_turnover
    }

def calculate_rank_advancement(db: Session, user_id: int) -> str:
    """Calculate and apply rank advancement for user - awards highest qualified rank"""
    import logging
    logger = logging.getLogger(__name__)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    current_rank = get_rank_by_name(db, user.current_rank)
    if not current_rank:
        return user.current_rank
    
    # Get all ranks higher than current
    higher_ranks = db.query(Rank).filter(
        Rank.level > current_rank.level
    ).order_by(Rank.level).all()
    
    # Check ALL ranks and find highest qualified
    highest_qualified_rank = None
    for rank in higher_ranks:
        qualification = check_rank_qualification(db, user_id, rank)
        if qualification["qualified"]:
            highest_qualified_rank = rank
            # Continue checking higher ranks
        # Don't break - check all ranks
    
    # Award highest qualified rank
    if highest_qualified_rank:
        user.current_rank = highest_qualified_rank.name
        user.rank_achieved_date = datetime.utcnow()
        
        # Update highest rank achieved
        if not user.highest_rank_achieved:
            user.highest_rank_achieved = highest_qualified_rank.name
        else:
            highest_ever = get_rank_by_name(db, user.highest_rank_achieved)
            if highest_ever and highest_qualified_rank.level > highest_ever.level:
                user.highest_rank_achieved = highest_qualified_rank.name
        
        db.commit()
        
        # Log activity
        log_activity(db, user_id, "rank_advancement", f"Advanced to {highest_qualified_rank.name}")
        logger.info(f"User {user_id} advanced to {highest_qualified_rank.name}")
        
        return highest_qualified_rank.name
    
    return user.current_rank

def calculate_user_rank(db: Session, user_id: int) -> str:
    """Calculate user rank (alias for calculate_rank_advancement)"""
    return calculate_rank_advancement(db, user_id)

def get_rank_progress(db: Session, user_id: int) -> dict:
    """Get user's rank progress information"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}
    
    current_rank = get_rank_by_name(db, user.current_rank)
    if not current_rank:
        return {}
    
    # Get next rank
    next_rank = db.query(Rank).filter(
        Rank.level > current_rank.level
    ).order_by(Rank.level).first()
    
    # Get current leg breakdown
    breakdown = calculate_leg_breakdown(db, user_id)
    
    progress = {
        "current_rank": current_rank.name,
        "current_level": current_rank.level,
        "next_rank": next_rank.name if next_rank else None,
        "next_level": next_rank.level if next_rank else None,
        "total_turnover": sum(leg["turnover"] for leg in breakdown["all_legs"]) if breakdown["all_legs"] else 0,
        "required_turnover": float(next_rank.team_turnover_required) if next_rank else 0,
        "first_leg_turnover": breakdown["first_leg"]["turnover"] if breakdown["first_leg"] else 0,
        "second_leg_turnover": breakdown["second_leg"]["turnover"] if breakdown["second_leg"] else 0,
        "other_legs_turnover": breakdown["other_legs"]["turnover"] if breakdown["other_legs"] else 0,
        "progress_percentage": 0
    }
    
    if next_rank and progress["required_turnover"] > 0:
        progress["progress_percentage"] = min(100, (progress["total_turnover"] / progress["required_turnover"]) * 100)
    
    return progress
