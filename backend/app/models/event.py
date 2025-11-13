from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class EventType(enum.Enum):
    webinar = "webinar"
    training = "training"
    announcement = "announcement"
    meeting = "meeting"
    conference = "conference"

class EventStatus(enum.Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class AttendanceStatus(enum.Enum):
    registered = "registered"
    attended = "attended"
    no_show = "no_show"

class PaymentStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(Enum(EventType), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False, index=True)
    end_date = Column(DateTime, nullable=True)
    location = Column(String(255), nullable=True)
    is_virtual = Column(Boolean, default=False)
    meeting_link = Column(String(500), nullable=True)
    max_attendees = Column(Integer, nullable=True)
    registration_required = Column(Boolean, default=True)
    registration_deadline = Column(DateTime, nullable=True)
    is_paid = Column(Boolean, default=False)
    price_ngn = Column(Numeric(10, 2), nullable=True)
    price_usdt = Column(Numeric(10, 2), nullable=True)
    allowed_payment_methods = Column(Text, nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.upcoming, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)
    attendance_status = Column(Enum(AttendanceStatus), default=AttendanceStatus.registered)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_method = Column(String(50), nullable=True)
    payment_reference = Column(String(255), nullable=True)
    amount_paid = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(10), nullable=True)
    payment_proof = Column(String(500), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User")
    
    # Unique constraint
    __table_args__ = (
        {"extend_existing": True}
    )
