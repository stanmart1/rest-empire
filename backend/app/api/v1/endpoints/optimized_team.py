from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.optimized_team_service import OptimizedTeamService
from app.schemas.team import TeamMemberResponse, TeamStatsResponse, LegBreakdownResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/stats", response_model=TeamStatsResponse)
def get_team_stats_optimized(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive team statistics with optimized queries"""
    try:
        stats = OptimizedTeamService.get_team_stats_bulk(db, current_user.id)
        performance = OptimizedTeamService.get_team_performance_summary(db, current_user.id)
        
        return TeamStatsResponse(
            total_team=stats["total_team"],
            first_line_count=stats["first_line_count"],
            total_turnover=stats["total_turnover"],
            levels=performance["levels"],
            totals=performance["totals"]
        )
    except Exception as e:
        logger.error(f"Error getting team stats for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team statistics")

@router.get("/members", response_model=List[TeamMemberResponse])
def get_team_members_optimized(
    depth: Optional[int] = Query(None, ge=1, le=15, description="Maximum depth to retrieve"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team members with preloaded statistics"""
    try:
        members = OptimizedTeamService.get_team_with_stats(db, current_user.id, depth)
        
        return [
            TeamMemberResponse(
                user_id=member["user_id"],
                name=member["name"],
                rank=member["rank"],
                depth=member["depth"],
                personal_turnover=member["personal_turnover"],
                total_turnover=member["total_turnover"],
                is_active=member["is_active"],
                registration_date=member["registration_date"]
            )
            for member in members
        ]
    except Exception as e:
        logger.error(f"Error getting team members for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve team members")

@router.get("/legs", response_model=LegBreakdownResponse)
def get_leg_breakdown_optimized(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get optimized leg breakdown for rank calculations"""
    try:
        breakdown = OptimizedTeamService.calculate_leg_breakdown_optimized(db, current_user.id)
        
        return LegBreakdownResponse(
            first_leg=breakdown["first_leg"],
            second_leg=breakdown["second_leg"],
            other_legs=breakdown["other_legs"],
            all_legs=breakdown["all_legs"]
        )
    except Exception as e:
        logger.error(f"Error getting leg breakdown for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve leg breakdown")

@router.get("/performance/{user_id}")
def get_member_performance(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get performance data for a specific team member"""
    try:
        # Verify user has access to this team member
        team_member = db.query(TeamMember).filter(
            TeamMember.ancestor_id == current_user.id,
            TeamMember.user_id == user_id,
            TeamMember.depth > 0
        ).first()
        
        if not team_member:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        performance = OptimizedTeamService.get_team_performance_summary(db, user_id)
        stats = OptimizedTeamService.get_team_stats_bulk(db, user_id)
        
        return {
            "user_id": user_id,
            "team_stats": stats,
            "performance": performance
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting member performance for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve member performance")
