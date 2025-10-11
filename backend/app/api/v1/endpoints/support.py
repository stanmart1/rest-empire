from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.support import SupportTicket, SupportResponse, TicketStatus
from app.schemas.support import SupportTicketCreate, SupportTicketResponse

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
        subject=ticket_data.subject,
        category=ticket_data.category or "general",
        message=ticket_data.message,
        status=TicketStatus.open
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {
        "message": "Support ticket created successfully",
        "ticket_id": ticket.id,
        "status": "open"
    }

@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_user_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's support tickets"""
    tickets = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.created_at.desc()).all()
    
    return tickets

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
