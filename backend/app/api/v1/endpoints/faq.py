from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.faq import FAQ
from app.schemas.faq import FAQResponse, FAQCreate, FAQUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[FAQResponse])
def get_faqs(db: Session = Depends(deps.get_db)):
    return db.query(FAQ).order_by(FAQ.order, FAQ.id).all()

@router.post("/", response_model=FAQResponse)
def create_faq(
    faq: FAQCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_faq = FAQ(**faq.dict())
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.put("/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: int,
    faq: FAQUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    for key, value in faq.dict().items():
        setattr(db_faq, key, value)
    
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.delete("/{faq_id}")
def delete_faq(
    faq_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    db.delete(db_faq)
    db.commit()
    return {"message": "FAQ deleted"}
