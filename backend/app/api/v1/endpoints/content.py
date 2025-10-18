from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.content import Content
from app.schemas.content import ContentResponse, ContentUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/{page}", response_model=ContentResponse)
def get_content(page: str, db: Session = Depends(deps.get_db)):
    content = db.query(Content).filter(Content.page == page).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.get("/", response_model=List[ContentResponse])
def get_all_content(db: Session = Depends(deps.get_db)):
    return db.query(Content).all()

@router.put("/{page}", response_model=ContentResponse)
def update_content(
    page: str,
    content_update: ContentUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    content = db.query(Content).filter(Content.page == page).first()
    if not content:
        content = Content(page=page, content=content_update.content)
        db.add(content)
    else:
        content.content = content_update.content
    
    db.commit()
    db.refresh(content)
    return content
