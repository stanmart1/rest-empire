from sqlalchemy.orm import Session
from app.models.user import User
from app.models.team import TeamMember
from app.schemas.team import TeamMemberInfo
from app.services.team_service import get_team_size

def build_team_member_info(user: User, db: Session, ancestor_id: int = None) -> TeamMemberInfo:
    """Build TeamMemberInfo from User object - eliminates duplication"""
    # Get team member record for personal turnover
    tm = db.query(TeamMember).filter(
        TeamMember.user_id == user.id,
        TeamMember.depth == 0
    ).first()
    
    # Get depth relative to ancestor if provided
    depth = 0
    if ancestor_id:
        depth_rel = db.query(TeamMember).filter(
            TeamMember.user_id == user.id,
            TeamMember.ancestor_id == ancestor_id
        ).first()
        depth = depth_rel.depth if depth_rel else 0
    
    # Get team size
    member_team_size = get_team_size(db, user.id)
    
    return TeamMemberInfo(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        current_rank=user.current_rank,
        registration_date=user.registration_date,
        is_verified=user.is_verified,
        is_active=user.is_active,
        activity_status=user.activity_status,
        personal_turnover=float(tm.personal_turnover) if tm else 0,
        team_size=member_team_size,
        depth=depth
    )
