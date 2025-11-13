from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.team_member import TeamMember
from app.schemas.team_member import TeamMember as TeamMemberSchema, TeamMemberCreate, TeamMemberUpdate

router = APIRouter()

@router.get("/", response_model=List[TeamMemberSchema])
def get_team_members(db: Session = Depends(deps.get_db)):
    return db.query(TeamMember).filter(TeamMember.is_active == True).order_by(TeamMember.display_order).all()

@router.post("/", response_model=TeamMemberSchema)
def create_team_member(team_member: TeamMemberCreate, db: Session = Depends(deps.get_db), current_user = Depends(deps.get_admin_user)):
    db_member = TeamMember(**team_member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.put("/{member_id}", response_model=TeamMemberSchema)
def update_team_member(member_id: int, team_member: TeamMemberUpdate, db: Session = Depends(deps.get_db), current_user = Depends(deps.get_admin_user)):
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    for key, value in team_member.dict(exclude_unset=True).items():
        setattr(db_member, key, value)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}")
def delete_team_member(member_id: int, db: Session = Depends(deps.get_db), current_user = Depends(deps.get_admin_user)):
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    db.delete(db_member)
    db.commit()
    return {"message": "Team member deleted"}
