from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.api import deps
from app.models.contact import Contact
from app.schemas.contact import ContactResponse, ContactUpdate
from app.models.contact_message import ContactMessage

router = APIRouter()

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    honeypot: str = ""
    timestamp: int

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
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
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

@router.post("/submit")
async def submit_contact_message(
    message_data: ContactMessageCreate,
    db: Session = Depends(deps.get_db)
):
    """Submit contact form message (public endpoint)"""
    import resend
    from app.services.config_service import get_config
    from datetime import datetime, timedelta
    
    # Rate limiting: Check if email sent message in last 5 minutes
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
    recent_message = db.query(ContactMessage).filter(
        ContactMessage.email == message_data.email,
        ContactMessage.created_at > five_minutes_ago
    ).first()
    
    if recent_message:
        raise HTTPException(
            status_code=429,
            detail="Please wait 5 minutes before sending another message"
        )
    
    # Honeypot check
    if message_data.honeypot:
        raise HTTPException(status_code=400, detail="Invalid submission")
    
    # Time-based check: Form must be filled for at least 3 seconds
    time_taken = int(datetime.utcnow().timestamp()) - message_data.timestamp
    if time_taken < 3:
        raise HTTPException(status_code=400, detail="Form submitted too quickly")
    
    message = ContactMessage(
        name=message_data.name,
        email=message_data.email,
        subject=message_data.subject,
        message=message_data.message
    )
    db.add(message)
    db.commit()
    
    # Send email notification to admin
    try:
        api_key = get_config(db, "resend_api_key")
        from_email = get_config(db, "from_email", "noreply@restempire.com")
        admin_email = get_config(db, "admin_email", "admin@restempire.com")
        
        if api_key:
            resend.api_key = api_key
            resend.Emails.send({
                "from": from_email,
                "to": admin_email,
                "subject": f"New Contact Form: {message_data.subject}",
                "html": f"""
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {message_data.name}</p>
                <p><strong>Email:</strong> {message_data.email}</p>
                <p><strong>Subject:</strong> {message_data.subject}</p>
                <p><strong>Message:</strong></p>
                <p>{message_data.message}</p>
                """
            })
    except Exception as e:
        pass  # Don't fail if email fails
    
    return {"message": "Thank you for your message! We'll get back to you soon."}

@router.get("/messages")
def get_contact_messages(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Get all contact messages (admin only)"""
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(ContactMessage).count()
    
    return {
        "messages": messages,
        "total": total
    }

@router.put("/messages/{message_id}/read")
def mark_message_read(
    message_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """Mark contact message as read (admin only)"""
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Message marked as read"}
