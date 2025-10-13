from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.support import SupportTicket, SupportResponse, TicketStatus
from app.utils.activity import log_activity

router = APIRouter()

class TicketResponse(BaseModel):
    message: str
    internal_note: Optional[str] = None

class TicketStatusUpdate(BaseModel):
    status: str

@router.get("/tickets")
def admin_get_all_tickets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all support tickets"""
    query = db.query(SupportTicket)
    
    if status:
        query = query.filter(SupportTicket.status == status)
    
    if category:
        query = query.filter(SupportTicket.category == category)
    
    if assigned_to:
        query = query.filter(SupportTicket.assigned_to == assigned_to)
    
    tickets = query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
    
    return tickets

@router.get("/tickets/{ticket_id}")
def admin_get_ticket_details(
    ticket_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get ticket details with responses"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    responses = db.query(SupportResponse).filter(
        SupportResponse.ticket_id == ticket_id
    ).order_by(SupportResponse.created_at).all()
    
    return {
        "ticket": ticket,
        "responses": responses
    }

@router.post("/tickets/{ticket_id}/assign")
def admin_assign_ticket(
    ticket_id: int,
    assigned_to: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Assign ticket to support agent"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.assigned_to = assigned_to
    ticket.assigned_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Ticket assigned successfully"}

@router.post("/tickets/{ticket_id}/respond")
def admin_respond_to_ticket(
    ticket_id: int,
    response: TicketResponse,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Respond to ticket"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Create response
    ticket_response = SupportResponse(
        ticket_id=ticket_id,
        responder_id=admin.id,
        message=response.message,
        is_internal=False,
        internal_note=response.internal_note
    )
    db.add(ticket_response)
    
    # Update ticket status
    ticket.status = TicketStatus.waiting_response
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Response added successfully"}

@router.put("/tickets/{ticket_id}/status")
def admin_update_ticket_status(
    ticket_id: int,
    status_update: TicketStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update ticket status"""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = TicketStatus[status_update.status]
    ticket.updated_at = datetime.utcnow()
    
    if status_update.status == "closed":
        ticket.closed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Ticket status updated successfully"}

@router.get("/tickets/stats/overview")
def admin_get_ticket_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get ticket statistics"""
    from sqlalchemy import func
    
    total_tickets = db.query(SupportTicket).count()
    open_tickets = db.query(SupportTicket).filter(
        SupportTicket.status.in_([TicketStatus.open, TicketStatus.in_progress])
    ).count()
    
    tickets_by_category = db.query(
        SupportTicket.category,
        func.count(SupportTicket.id)
    ).group_by(SupportTicket.category).all()
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "closed_tickets": total_tickets - open_tickets,
        "by_category": [{"category": c, "count": count} for c, count in tickets_by_category]
    }
