from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.team import TeamMember
from typing import List, Dict

def get_team_members(db: Session, user_id: int, depth: int = None) -> List[TeamMember]:
    """Get all team members for a user up to specified depth"""
    query = db.query(TeamMember).filter(
        TeamMember.ancestor_id == user_id,
        TeamMember.depth > 0
    )
    
    if depth:
        query = query.filter(TeamMember.depth <= depth)
    
    return query.all()

def get_first_line(db: Session, user_id: int) -> List[User]:
    """Get direct referrals (first line)"""
    return db.query(User).filter(User.sponsor_id == user_id).all()

def get_team_size(db: Session, user_id: int) -> int:
    """Get total team size"""
    return db.query(TeamMember).filter(
        TeamMember.ancestor_id == user_id,
        TeamMember.depth > 0
    ).count()

def get_leg_turnover(db: Session, ancestor_id: int, first_line_member_id: int) -> float:
    """Calculate total turnover for a specific leg"""
    # Get all team members under this first-line member
    leg_members = db.query(TeamMember).filter(
        TeamMember.ancestor_id == first_line_member_id,
        TeamMember.depth >= 0
    ).all()
    
    member_ids = [tm.user_id for tm in leg_members]
    
    # Sum their turnovers
    total = db.query(func.sum(TeamMember.personal_turnover)).filter(
        TeamMember.user_id.in_(member_ids),
        TeamMember.depth == 0
    ).scalar() or 0
    
    return float(total)

def calculate_leg_breakdown(db: Session, user_id: int) -> Dict:
    """Calculate turnover breakdown by legs"""
    first_line = get_first_line(db, user_id)
    
    if not first_line:
        return {
            "first_leg": None,
            "second_leg": None,
            "other_legs": 0,
            "all_legs": []
        }
    
    # Calculate turnover for each leg
    leg_data = []
    for member in first_line:
        turnover = get_leg_turnover(db, user_id, member.id)
        team_size = get_team_size(db, member.id) + 1  # +1 for the member itself
        
        leg_data.append({
            "member_id": member.id,
            "member_name": member.full_name or member.email,
            "team_size": team_size,
            "turnover": turnover
        })
    
    # Sort by turnover descending
    leg_data.sort(key=lambda x: x["turnover"], reverse=True)
    
    # Calculate total turnover
    total_turnover = sum(leg["turnover"] for leg in leg_data)
    
    # Add percentages
    for leg in leg_data:
        leg["percentage"] = (leg["turnover"] / total_turnover * 100) if total_turnover > 0 else 0
    
    # Get first, second, and others
    first_leg = leg_data[0] if len(leg_data) > 0 else None
    second_leg = leg_data[1] if len(leg_data) > 1 else None
    other_legs_turnover = sum(leg["turnover"] for leg in leg_data[2:]) if len(leg_data) > 2 else 0
    other_legs_percentage = (other_legs_turnover / total_turnover * 100) if total_turnover > 0 else 0
    
    return {
        "first_leg": first_leg,
        "second_leg": second_leg,
        "other_legs": {
            "turnover": other_legs_turnover,
            "percentage": other_legs_percentage,
            "count": len(leg_data) - 2 if len(leg_data) > 2 else 0
        },
        "all_legs": leg_data
    }

def update_team_turnover(db: Session, user_id: int, amount: float):
    """Update turnover for user and all ancestors"""
    # Update user's personal turnover
    user_team = db.query(TeamMember).filter(
        TeamMember.user_id == user_id,
        TeamMember.depth == 0
    ).first()
    
    if user_team:
        user_team.personal_turnover += amount
    
    # Update all ancestors' total turnover
    ancestors = db.query(TeamMember).filter(
        TeamMember.user_id == user_id,
        TeamMember.depth > 0
    ).all()
    
    for ancestor_rel in ancestors:
        ancestor_team = db.query(TeamMember).filter(
            TeamMember.user_id == ancestor_rel.ancestor_id,
            TeamMember.ancestor_id == ancestor_rel.ancestor_id,
            TeamMember.depth == 0
        ).first()
        
        if ancestor_team:
            ancestor_team.total_turnover += amount
    
    db.commit()
