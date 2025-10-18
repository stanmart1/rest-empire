from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.about import About
from app.schemas.about import AboutResponse, AboutUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=AboutResponse)
def get_about(db: Session = Depends(deps.get_db)):
    about = db.query(About).first()
    if not about:
        raise HTTPException(status_code=404, detail="About content not found")
    return about

@router.put("/", response_model=AboutResponse)
def update_about(
    about_update: AboutUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    about = db.query(About).first()
    if not about:
        about = About(content=about_update.content)
        db.add(about)
    else:
        about.content = about_update.content
    
    db.commit()
    db.refresh(about)
    return about
