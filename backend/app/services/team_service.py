from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text
from app.models.user import User
from app.models.team import TeamMember
from app.services.optimized_team_service import OptimizedTeamService
from typing import List, Dict

def get_team_members(db: Session, user_id: int, depth: int = None) -> List[TeamMember]:
    """Get all team members for a user up to specified depth - optimized"""
    query = db.query(TeamMember).options(
        joinedload(TeamMember.user)
    ).filter(
        TeamMember.ancestor_id == user_id,
        TeamMember.depth > 0
    )
    
    if depth:
        query = query.filter(TeamMember.depth <= depth)
    
    return query.all()

def get_first_line(db: Session, user_id: int) -> List[User]:
    """Get direct referrals (first line) - optimized"""
    return db.query(User).filter(
        User.sponsor_id == user_id,
        User.is_active == True
    ).all()

def get_team_size(db: Session, user_id: int) -> int:
    """Get total team size - optimized with index"""
    return db.query(func.count(TeamMember.user_id)).filter(
        TeamMember.ancestor_id == user_id,
        TeamMember.depth > 0
    ).scalar() or 0

def get_leg_turnover(db: Session, ancestor_id: int, first_line_member_id: int) -> float:
    """Calculate total turnover for a specific leg - optimized"""
    # Use optimized query with proper joins
    result = db.query(
        func.coalesce(func.sum(TeamMember.personal_turnover), 0)
    ).filter(
        TeamMember.ancestor_id == first_line_member_id
    ).scalar()
    
    return float(result or 0)

def calculate_leg_breakdown(db: Session, user_id: int) -> Dict:
    """Calculate turnover breakdown by legs - use optimized version"""
    return OptimizedTeamService.calculate_leg_breakdown_optimized(db, user_id)

def update_team_turnover(db: Session, user_id: int, amount: float):
    """Update turnover for user and all ancestors - optimized batch update"""
    # Use bulk update for better performance
    db.execute(
        text("""
            UPDATE team_members 
            SET personal_turnover = personal_turnover + :amount
            WHERE user_id = :user_id AND depth = 0
        """),
        {"user_id": user_id, "amount": amount}
    )
    
    # Update ancestors in batch
    db.execute(
        text("""
            UPDATE team_members 
            SET total_turnover = total_turnover + :amount
            WHERE ancestor_id IN (
                SELECT ancestor_id 
                FROM team_members 
                WHERE user_id = :user_id AND depth > 0
            ) AND depth = 0
        """),
        {"user_id": user_id, "amount": amount}
    )
    
    db.commit()
