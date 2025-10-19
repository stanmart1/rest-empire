from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.about import About
from app.schemas.about import AboutResponse, AboutUpdate

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
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
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
