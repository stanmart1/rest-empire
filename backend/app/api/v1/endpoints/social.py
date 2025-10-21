from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.social import Social
from app.schemas.social import SocialResponse, SocialUpdate

router = APIRouter()

@router.get("/", response_model=SocialResponse)
def get_social(db: Session = Depends(deps.get_db)):
    social = db.query(Social).first()
    if not social:
        raise HTTPException(status_code=404, detail="Social links not found")
    return social

@router.put("/", response_model=SocialResponse)
def update_social(
    social_update: SocialUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    social = db.query(Social).first()
    if not social:
        social = Social(content=social_update.content)
        db.add(social)
    else:
        social.content = social_update.content
    
    db.commit()
    db.refresh(social)
    return social
