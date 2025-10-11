from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.bonus import Bonus
from app.models.payout import Payout
from app.models.activation import UserActivation
from app.services.optimized_team_service import OptimizedTeamService

router = APIRouter()

# Rank requirements mapping
RANK_REQUIREMENTS = {
    "Amber": {"turnover": 0, "next_rank": "Pearl", "next_turnover": 5000},
    "Pearl": {"turnover": 5000, "next_rank": "Sapphire", "next_turnover": 15000},
    "Sapphire": {"turnover": 15000, "next_rank": "Ruby", "next_turnover": 25000},
    "Ruby": {"turnover": 25000, "next_rank": "Emerald", "next_turnover": 50000},
    "Emerald": {"turnover": 50000, "next_rank": "Diamond", "next_turnover": 100000},
    "Diamond": {"turnover": 100000, "next_rank": "Black Diamond", "next_turnover": 250000},
    "Black Diamond": {"turnover": 250000, "next_rank": "Crown Diamond", "next_turnover": 500000},
    "Crown Diamond": {"turnover": 500000, "next_rank": "Royal Crown", "next_turnover": 1000000},
    "Royal Crown": {"turnover": 1000000, "next_rank": None, "next_turnover": None}
}

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for current user."""
    
    # Get team stats
    team_stats = OptimizedTeamService.get_team_stats_bulk(db, current_user.id)
    
    # Get recent bonuses (30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_bonuses = db.query(func.sum(Bonus.amount)).filter(
        and_(
            Bonus.user_id == current_user.id,
            Bonus.created_at >= thirty_days_ago,
            Bonus.status == 'paid'
        )
    ).scalar() or 0
    
    # Get pending payouts
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        and_(
            Payout.user_id == current_user.id,
            Payout.status.in_(['pending', 'processing'])
        )
    ).scalar() or 0
    
    # Get activation status
    activation = db.query(UserActivation).filter(
        UserActivation.user_id == current_user.id
    ).first()
    
    # Calculate rank progress
    current_rank = current_user.current_rank or "Amber"
    rank_info = RANK_REQUIREMENTS.get(current_rank, RANK_REQUIREMENTS["Amber"])
    
    user_turnover = team_stats.get("total_turnover", 0)
    current_requirement = rank_info["turnover"]
    next_requirement = rank_info["next_turnover"]
    
    if next_requirement:
        progress_percentage = min(100, ((user_turnover - current_requirement) / (next_requirement - current_requirement)) * 100)
    else:
        progress_percentage = 100  # Max rank achieved
    
    return {
        "balance_eur": float(current_user.balance_ngn or 0),
        "balance_usdt": float(current_user.balance_usdt or 0), 
        "balance_dbsp": 0.0,  # DBSP not implemented yet
        "total_earnings": float(current_user.total_earnings or 0),
        "recent_earnings_30d": float(recent_bonuses),
        "pending_payouts": float(pending_payouts),
        "team_size": team_stats.get("total_team", 0),
        "first_line_count": team_stats.get("first_line", 0),
        "current_rank": current_rank,
        "rank_progress": {
            "percentage": max(0, progress_percentage),
            "current_turnover": user_turnover,
            "next_requirement": next_requirement,
            "next_rank": rank_info["next_rank"]
        },
        "is_active": activation.status == "active" if activation else False
    }
