from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TicketStatus(enum.Enum):
    open = "open"
    in_progress = "in_progress"
    waiting_response = "waiting_response"
    closed = "closed"

class TicketPriority(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    category = Column(String, index=True)
    message = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.open, index=True)
    priority = Column(Enum(TicketPriority), default=TicketPriority.medium)
    
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime)
    
    user = relationship("User", back_populates="support_tickets", foreign_keys=[user_id])
    assigned_admin = relationship("User", foreign_keys=[assigned_to])
    responses = relationship("SupportResponse", back_populates="ticket")

class SupportResponse(Base):
    __tablename__ = "support_responses"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_internal_note = Column(String, default=False)
    attachments = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    ticket = relationship("SupportTicket", back_populates="responses")
    author = relationship("User")
