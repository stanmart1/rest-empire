from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.optimized_team_service import OptimizedTeamService
from app.services.optimized_bonus_engine import OptimizedBonusEngine

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for current user."""
    
    # Get team stats
    team_stats = OptimizedTeamService.get_team_stats_bulk(db, current_user.id)
    
    # Get bonus summary
    bonus_summary = OptimizedBonusEngine.get_user_bonus_summary(db, current_user.id, days=30)
    
    # Calculate balances
    balance = {
        "eur": float(current_user.balance_ngn or 0),  # Using NGN as EUR equivalent
        "usdt": float(current_user.balance_usdt or 0),
        "dbsp": 0  # DBSP balance would be calculated separately
    }
    
    return {
        "balance": balance,
        "totalEarnings": float(current_user.total_earnings or 0),
        "monthlyEarnings": bonus_summary.get("total_amount", 0),
        "teamSize": team_stats.get("total_team", 0),
        "pendingPayouts": 0,  # Would be calculated from payouts table
        "rankProgress": {
            "currentRank": current_user.current_rank,
            "progress": 65  # Would be calculated based on requirements
        }
    }
