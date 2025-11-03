from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    cursor: Optional[int] = Query(None, description="Last user_id from previous page"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team tree with cursor-based pagination - optimized for large teams"""
    from sqlalchemy.orm import joinedload
    
    query = db.query(TeamMember).options(
        joinedload(TeamMember.user)
    ).filter(
        TeamMember.ancestor_id == current_user.id,
        TeamMember.depth > 0
    )
    
    if depth:
        query = query.filter(TeamMember.depth <= depth)
    
    # Cursor-based pagination
    if cursor:
        query = query.filter(TeamMember.user_id > cursor)
    
    query = query.order_by(TeamMember.user_id).limit(limit)
    team_members = query.all()
    
    if not team_members:
        return []
    
    # Batch get team sizes
    user_ids = [tm.user_id for tm in team_members]
    team_sizes = db.query(
        TeamMember.ancestor_id,
        func.count(TeamMember.user_id).label('size')
    ).filter(
        TeamMember.ancestor_id.in_(user_ids),
        TeamMember.depth > 0
    ).group_by(TeamMember.ancestor_id).all()
    
    size_map = {ancestor_id: size for ancestor_id, size in team_sizes}
    
    result = []
    for tm in team_members:
        result.append(TeamMemberInfo(
            id=tm.user.id,
            full_name=tm.user.full_name,
            email=tm.user.email,
            current_rank=tm.user.current_rank,
            registration_date=tm.user.registration_date,
            is_verified=tm.user.is_verified,
            is_active=tm.user.is_active,
            activity_status=tm.user.activity_status,
            personal_turnover=float(tm.personal_turnover) if tm.personal_turnover else 0,
            team_size=size_map.get(tm.user_id, 0),
            depth=tm.depth
        ))
    
    return result

@router.get("/first-line", response_model=List[TeamMemberInfo])
def get_first_line_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct referrals (first line) - optimized"""
    from sqlalchemy.orm import joinedload
    
    # Get users with their team member data in one query
    first_line = db.query(User).filter(
        User.sponsor_id == current_user.id,
        User.is_active == True
    ).all()
    
    if not first_line:
        return []
    
    user_ids = [u.id for u in first_line]
    
    # Batch get personal turnover
    turnovers = db.query(
        TeamMember.user_id,
        TeamMember.personal_turnover
    ).filter(
        TeamMember.user_id.in_(user_ids),
        TeamMember.depth == 0
    ).all()
    turnover_map = {uid: float(t) if t else 0 for uid, t in turnovers}
    
    # Batch get team sizes
    team_sizes = db.query(
        TeamMember.ancestor_id,
        func.count(TeamMember.user_id).label('size')
    ).filter(
        TeamMember.ancestor_id.in_(user_ids),
        TeamMember.depth > 0
    ).group_by(TeamMember.ancestor_id).all()
    size_map = {ancestor_id: size for ancestor_id, size in team_sizes}
    
    result = []
    for user in first_line:
        result.append(TeamMemberInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            current_rank=user.current_rank,
            registration_date=user.registration_date,
            is_verified=user.is_verified,
            is_active=user.is_active,
            activity_status=user.activity_status,
            personal_turnover=turnover_map.get(user.id, 0),
            team_size=size_map.get(user.id, 0),
            depth=1
        ))
    
    return result

@router.get("/stats", response_model=TeamStats)
def get_team_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team statistics - optimized without loading all members"""
    # Total team size - single count query
    total_team_size = db.query(func.count(TeamMember.user_id)).filter(
        TeamMember.ancestor_id == current_user.id,
        TeamMember.depth > 0
    ).scalar() or 0
    
    # First line count - single count query
    first_line_count = db.query(func.count(User.id)).filter(
        User.sponsor_id == current_user.id
    ).scalar() or 0
    
    # Active members - single query with join
    active_members = db.query(func.count(User.id)).join(
        TeamMember, TeamMember.user_id == User.id
    ).filter(
        TeamMember.ancestor_id == current_user.id,
        TeamMember.depth > 0,
        User.is_active == True,
        User.activity_status == "active"
    ).scalar() or 0
    
    inactive_members = total_team_size - active_members
    
    # Total team turnover - single query
    user_team = db.query(TeamMember.total_turnover).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.depth == 0
    ).scalar()
    
    total_turnover = float(user_team) if user_team else 0
    
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
    """Search and filter team members - optimized"""
    # Get member IDs in one query
    member_ids_query = db.query(TeamMember.user_id).filter(
        TeamMember.ancestor_id == current_user.id,
        TeamMember.depth > 0
    )
    member_ids = [row[0] for row in member_ids_query.all()]
    
    if not member_ids:
        return []
    
    user_query = db.query(User).filter(User.id.in_(member_ids))
    
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
    
    users = user_query.offset(skip).limit(limit).all()
    
    if not users:
        return []
    
    user_ids = [u.id for u in users]
    
    # Batch get depths
    depths = db.query(
        TeamMember.user_id,
        TeamMember.depth
    ).filter(
        TeamMember.user_id.in_(user_ids),
        TeamMember.ancestor_id == current_user.id
    ).all()
    depth_map = {uid: d for uid, d in depths}
    
    # Batch get turnovers
    turnovers = db.query(
        TeamMember.user_id,
        TeamMember.personal_turnover
    ).filter(
        TeamMember.user_id.in_(user_ids),
        TeamMember.depth == 0
    ).all()
    turnover_map = {uid: float(t) if t else 0 for uid, t in turnovers}
    
    # Batch get team sizes
    team_sizes = db.query(
        TeamMember.ancestor_id,
        func.count(TeamMember.user_id).label('size')
    ).filter(
        TeamMember.ancestor_id.in_(user_ids),
        TeamMember.depth > 0
    ).group_by(TeamMember.ancestor_id).all()
    size_map = {ancestor_id: size for ancestor_id, size in team_sizes}
    
    result = []
    for user in users:
        result.append(TeamMemberInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            current_rank=user.current_rank,
            registration_date=user.registration_date,
            is_verified=user.is_verified,
            is_active=user.is_active,
            activity_status=user.activity_status,
            personal_turnover=turnover_map.get(user.id, 0),
            team_size=size_map.get(user.id, 0),
            depth=depth_map.get(user.id, 0)
        ))
    
    return result

@router.get("/member/{member_id}/children", response_model=List[TeamMemberInfo])
def get_member_children(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get direct children of a specific team member - lazy loading optimized"""
    # Verify access
    is_in_team = db.query(TeamMember.user_id).filter(
        TeamMember.user_id == member_id,
        TeamMember.ancestor_id == current_user.id
    ).first()
    
    if not is_in_team and member_id != current_user.id:
        raise HTTPException(status_code=403, detail="Member not in your team")
    
    # Get children
    children = db.query(User).filter(User.sponsor_id == member_id).all()
    
    if not children:
        return []
    
    user_ids = [u.id for u in children]
    
    # Batch get depths
    depths = db.query(
        TeamMember.user_id,
        TeamMember.depth
    ).filter(
        TeamMember.user_id.in_(user_ids),
        TeamMember.ancestor_id == current_user.id
    ).all()
    depth_map = {uid: d for uid, d in depths}
    
    # Batch get turnovers
    turnovers = db.query(
        TeamMember.user_id,
        TeamMember.personal_turnover
    ).filter(
        TeamMember.user_id.in_(user_ids),
        TeamMember.depth == 0
    ).all()
    turnover_map = {uid: float(t) if t else 0 for uid, t in turnovers}
    
    # Batch get team sizes
    team_sizes = db.query(
        TeamMember.ancestor_id,
        func.count(TeamMember.user_id).label('size')
    ).filter(
        TeamMember.ancestor_id.in_(user_ids),
        TeamMember.depth > 0
    ).group_by(TeamMember.ancestor_id).all()
    size_map = {ancestor_id: size for ancestor_id, size in team_sizes}
    
    result = []
    for user in children:
        result.append(TeamMemberInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            current_rank=user.current_rank,
            registration_date=user.registration_date,
            is_verified=user.is_verified,
            is_active=user.is_active,
            activity_status=user.activity_status,
            personal_turnover=turnover_map.get(user.id, 0),
            team_size=size_map.get(user.id, 0),
            depth=depth_map.get(user.id, 0)
        ))
    
    return result
