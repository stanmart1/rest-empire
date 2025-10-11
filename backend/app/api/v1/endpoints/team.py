from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.team import TeamMember
from app.schemas.team import TeamMemberInfo, TeamStats, TeamLegBreakdown, LegStats
from app.services.team_service import (
    get_team_members, get_first_line, get_team_size,
    calculate_leg_breakdown
)

router = APIRouter()

@router.get("/tree", response_model=List[TeamMemberInfo])
def get_team_tree(
    depth: Optional[int] = Query(None, ge=1, le=15),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team tree with optional depth limit"""
    team_members = get_team_members(db, current_user.id, depth)
    
    # Get user details for each team member
    result = []
    for tm in team_members[skip:skip+limit]:
        user = db.query(User).filter(User.id == tm.user_id).first()
        if user:
            # Get team size for this member
            member_team_size = get_team_size(db, user.id)
            
            result.append(TeamMemberInfo(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                current_rank=user.current_rank,
                registration_date=user.registration_date,
                is_verified=user.is_verified,
                is_active=user.is_active,
                activity_status=user.activity_status,
                personal_turnover=float(tm.personal_turnover),
                team_size=member_team_size,
                depth=tm.depth
            ))
    
    return result

@router.get("/first-line", response_model=List[TeamMemberInfo])
def get_first_line_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct referrals (first line)"""
    first_line = get_first_line(db, current_user.id)
    
    result = []
    for user in first_line:
        # Get team member info
        tm = db.query(TeamMember).filter(
            TeamMember.user_id == user.id,
            TeamMember.depth == 0
        ).first()
        
        member_team_size = get_team_size(db, user.id)
        
        result.append(TeamMemberInfo(
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
            depth=1
        ))
    
    return result

@router.get("/stats", response_model=TeamStats)
def get_team_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team statistics"""
    # Total team size
    total_team_size = get_team_size(db, current_user.id)
    
    # First line count
    first_line_count = len(get_first_line(db, current_user.id))
    
    # Active/inactive members
    team_members = get_team_members(db, current_user.id)
    member_ids = [tm.user_id for tm in team_members]
    
    active_members = db.query(User).filter(
        User.id.in_(member_ids),
        User.is_active == True,
        User.activity_status == "active"
    ).count() if member_ids else 0
    
    inactive_members = total_team_size - active_members
    
    # Total team turnover
    user_team = db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.depth == 0
    ).first()
    
    total_turnover = float(user_team.total_turnover) if user_team else 0
    
    return TeamStats(
        total_team_size=total_team_size,
        first_line_count=first_line_count,
        active_members=active_members,
        inactive_members=inactive_members,
        total_team_turnover=total_turnover
    )

@router.get("/legs", response_model=TeamLegBreakdown)
def get_leg_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get turnover breakdown by legs"""
    breakdown = calculate_leg_breakdown(db, current_user.id)
    
    first_leg = LegStats(**breakdown["first_leg"]) if breakdown["first_leg"] else None
    second_leg = LegStats(**breakdown["second_leg"]) if breakdown["second_leg"] else None
    
    other_legs = LegStats(
        member_id=0,
        member_name="Other Legs Combined",
        team_size=breakdown["other_legs"]["count"],
        turnover=breakdown["other_legs"]["turnover"],
        percentage=breakdown["other_legs"]["percentage"]
    )
    
    all_legs = [LegStats(**leg) for leg in breakdown["all_legs"]]
    
    return TeamLegBreakdown(
        first_leg=first_leg,
        second_leg=second_leg,
        other_legs_combined=other_legs,
        all_legs=all_legs
    )

@router.get("/search", response_model=List[TeamMemberInfo])
def search_team(
    query: Optional[str] = Query(None, min_length=2),
    rank: Optional[str] = None,
    activity_status: Optional[str] = None,
    is_verified: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search and filter team members"""
    # Get all team member IDs
    team_members = get_team_members(db, current_user.id)
    member_ids = [tm.user_id for tm in team_members]
    
    if not member_ids:
        return []
    
    # Build query
    user_query = db.query(User).filter(User.id.in_(member_ids))
    
    # Apply filters
    if query:
        user_query = user_query.filter(
            (User.full_name.ilike(f"%{query}%")) | 
            (User.email.ilike(f"%{query}%")) |
            (User.referral_code.ilike(f"%{query}%"))
        )
    
    if rank:
        user_query = user_query.filter(User.current_rank == rank)
    
    if activity_status:
        user_query = user_query.filter(User.activity_status == activity_status)
    
    if is_verified is not None:
        user_query = user_query.filter(User.is_verified == is_verified)
    
    # Get results
    users = user_query.offset(skip).limit(limit).all()
    
    # Build response
    result = []
    for user in users:
        tm = db.query(TeamMember).filter(
            TeamMember.user_id == user.id,
            TeamMember.ancestor_id == current_user.id
        ).first()
        
        user_tm = db.query(TeamMember).filter(
            TeamMember.user_id == user.id,
            TeamMember.depth == 0
        ).first()
        
        member_team_size = get_team_size(db, user.id)
        
        result.append(TeamMemberInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            current_rank=user.current_rank,
            registration_date=user.registration_date,
            is_verified=user.is_verified,
            is_active=user.is_active,
            activity_status=user.activity_status,
            personal_turnover=float(user_tm.personal_turnover) if user_tm else 0,
            team_size=member_team_size,
            depth=tm.depth if tm else 0
        ))
    
    return result

@router.get("/member/{member_id}/children", response_model=List[TeamMemberInfo])
def get_member_children(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct children of a specific team member (for lazy loading tree)"""
    # Verify member is in user's team
    is_in_team = db.query(TeamMember).filter(
        TeamMember.user_id == member_id,
        TeamMember.ancestor_id == current_user.id
    ).first()
    
    if not is_in_team and member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Member not in your team")
    
    # Get direct children
    children = db.query(User).filter(User.sponsor_id == member_id).all()
    
    result = []
    for user in children:
        tm = db.query(TeamMember).filter(
            TeamMember.user_id == user.id,
            TeamMember.depth == 0
        ).first()
        
        member_team_size = get_team_size(db, user.id)
        
        # Get depth relative to current_user
        depth_rel = db.query(TeamMember).filter(
            TeamMember.user_id == user.id,
            TeamMember.ancestor_id == current_user.id
        ).first()
        
        result.append(TeamMemberInfo(
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
            depth=depth_rel.depth if depth_rel else 0
        ))
    
    return result
