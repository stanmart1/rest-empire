from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.event import EventType, EventStatus, AttendanceStatus

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
    status: Optional[EventStatus] = None

class EventResponse(EventBase):
    id: int
    status: EventStatus
    current_attendees: int
    is_registered: bool = False
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EventRegistrationResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    registered_at: datetime
    attendance_status: AttendanceStatus
    
    class Config:
        from_attributes = True

class EventStats(BaseModel):
    total_events: int
    upcoming_events: int
    completed_events: int
    total_registrations: int
