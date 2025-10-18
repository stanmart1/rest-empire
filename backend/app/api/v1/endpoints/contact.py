from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.contact import Contact
from app.schemas.contact import ContactResponse, ContactUpdate
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=ContactResponse)
def get_contact(db: Session = Depends(deps.get_db)):
    contact = db.query(Contact).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact content not found")
    return contact

@router.put("/", response_model=ContactResponse)
def update_contact(
    contact_update: ContactUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    contact = db.query(Contact).first()
    if not contact:
        contact = Contact(content=contact_update.content)
        db.add(contact)
    else:
        contact.content = contact_update.content
    
    db.commit()
    db.refresh(contact)
    return contact
