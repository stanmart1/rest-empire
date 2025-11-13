from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.event import EventType, EventStatus, AttendanceStatus, PaymentStatus

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    is_virtual: bool = False
    meeting_link: Optional[str] = None
    max_attendees: Optional[int] = None
    registration_required: bool = True
    registration_deadline: Optional[datetime] = None
    is_paid: bool = False
    price_ngn: Optional[Decimal] = None
    price_usdt: Optional[Decimal] = None
    allowed_payment_methods: Optional[str] = None
    is_public: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    meeting_link: Optional[str] = None
    max_attendees: Optional[int] = None
    registration_required: Optional[bool] = None
    registration_deadline: Optional[datetime] = None
    is_paid: Optional[bool] = None
    price_ngn: Optional[Decimal] = None
    price_usdt: Optional[Decimal] = None
    allowed_payment_methods: Optional[str] = None
    is_public: Optional[bool] = None
    status: Optional[EventStatus] = None

class EventResponse(EventBase):
    id: int
    status: EventStatus
    current_attendees: int
    is_registered: bool = False
    public_link: Optional[str] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EventRegistrationResponse(BaseModel):
    id: int
    event_id: int
    user_id: Optional[int] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    registered_at: datetime
    attendance_status: AttendanceStatus
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    amount_paid: Optional[Decimal] = None
    currency: Optional[str] = None
    paid_at: Optional[datetime] = None
    registration_code: Optional[str] = None
    user: Optional[dict] = None
    
    class Config:
        from_attributes = True

class EventPaymentRequest(BaseModel):
    payment_method: str
    currency: str
    payment_proof: Optional[str] = None

class EventStats(BaseModel):
    total_events: int
    upcoming_events: int
    completed_events: int
    total_registrations: int

class PublicEventRegistration(BaseModel):
    guest_name: str
    guest_email: str
    guest_phone: Optional[str] = None
    payment_method: Optional[str] = None
    currency: Optional[str] = None
    payment_proof: Optional[str] = None
