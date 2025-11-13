from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.support import SupportTicket, SupportResponse, TicketStatus
from app.schemas.support import SupportTicketCreate, SupportTicketResponse
from app.core.sanitization import sanitize_text

router = APIRouter()

@router.post("/tickets", response_model=dict)
def create_support_ticket(
    ticket_data: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new support ticket"""
    ticket = SupportTicket(
        user_id=current_user.id,
        subject=sanitize_text(ticket_data.subject),
        category=ticket_data.category or "general",
        message=sanitize_text(ticket_data.message),
        status=TicketStatus.open
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {
        "message": "Support ticket created successfully. Our team will respond within 24 hours.",
        "ticket_id": ticket.id,
        "status": "open"
    }

@router.get("/tickets")
def get_user_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's support tickets with responses"""
    tickets = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.created_at.desc()).all()
    
    result = []
    for ticket in tickets:
        responses = db.query(SupportResponse).filter(
            SupportResponse.ticket_id == ticket.id
        ).order_by(SupportResponse.created_at).all()
        
        ticket_dict = {
            "id": ticket.id,
            "subject": ticket.subject,
            "category": ticket.category,
            "message": ticket.message,
            "status": ticket.status.value,
            "priority": ticket.priority.value,
            "created_at": ticket.created_at.isoformat(),
            "responses": [
                {
                    "id": r.id,
                    "message": r.message,
                    "created_at": r.created_at.isoformat(),
                    "author": {"full_name": r.author.full_name}
                }
                for r in responses
            ]
        }
        result.append(ticket_dict)
    
    return result

@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
def get_ticket_details(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific ticket details"""
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket
