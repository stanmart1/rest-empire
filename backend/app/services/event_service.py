from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime
from app.models.event import Event, EventRegistration, EventStatus, EventType
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate

def get_events(
    db: Session,
    user_id: Optional[int] = None,
    event_type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    upcoming_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[Event]:
    """Get events with optional filters"""
    query = db.query(Event)
    
    if event_type:
        query = query.filter(Event.event_type == event_type)
    
    if status:
        query = query.filter(Event.status == status)
    
    if upcoming_only:
        query = query.filter(
            and_(
                Event.start_date > datetime.utcnow(),
                Event.status == EventStatus.upcoming
            )
        )
    
    events = query.order_by(Event.start_date.asc()).offset(skip).limit(limit).all()
    
    # Add registration status if user_id provided
    if user_id:
        for event in events:
            registration = db.query(EventRegistration).filter(
                and_(
                    EventRegistration.event_id == event.id,
                    EventRegistration.user_id == user_id
                )
            ).first()
            event.is_registered = registration is not None
    
    return events

def get_event_by_id(db: Session, event_id: int, user_id: Optional[int] = None) -> Optional[Event]:
    """Get event by ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if event and user_id:
        registration = db.query(EventRegistration).filter(
            and_(
                EventRegistration.event_id == event.id,
                EventRegistration.user_id == user_id
            )
        ).first()
        event.is_registered = registration is not None
    
    return event

def create_event(db: Session, event_data: EventCreate, created_by: int) -> Event:
    """Create new event"""
    event = Event(
        **event_data.dict(),
        created_by=created_by
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def update_event(db: Session, event_id: int, event_data: EventUpdate) -> Optional[Event]:
    """Update event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return None
    
    update_data = event_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return event

def delete_event(db: Session, event_id: int) -> bool:
    """Delete event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return False
    
    db.delete(event)
    db.commit()
    return True

def register_for_event(db: Session, event_id: int, user_id: int) -> Optional[EventRegistration]:
    """Register user for event"""
    # Check if event exists and registration is allowed
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event or not event.registration_required:
        return None
    
    # Check if registration deadline passed
    if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
        return None
    
    # Check if already registered
    existing = db.query(EventRegistration).filter(
        and_(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user_id
        )
    ).first()
    if existing:
        return existing
    
    # Check capacity
    if event.max_attendees:
        current_count = db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id
        ).count()
        if current_count >= event.max_attendees:
            return None
    
    # Create registration
    registration = EventRegistration(
        event_id=event_id,
        user_id=user_id
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

def unregister_from_event(db: Session, event_id: int, user_id: int) -> bool:
    """Unregister user from event"""
    registration = db.query(EventRegistration).filter(
        and_(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user_id
        )
    ).first()
    
    if not registration:
        return False
    
    db.delete(registration)
    db.commit()
    return True

def get_user_events(db: Session, user_id: int, upcoming_only: bool = False) -> List[Event]:
    """Get events user is registered for"""
    query = db.query(Event).join(EventRegistration).filter(
        EventRegistration.user_id == user_id
    )
    
    if upcoming_only:
        # Include both upcoming and ongoing events, exclude completed and cancelled
        query = query.filter(Event.status.in_(['upcoming', 'ongoing']))
    
    return query.order_by(Event.start_date.asc()).all()

def get_event_attendees(db: Session, event_id: int) -> List[EventRegistration]:
    """Get event attendees"""
    return db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()

def update_attendance_status(
    db: Session, 
    event_id: int, 
    user_id: int, 
    status: str
) -> Optional[EventRegistration]:
    """Update attendance status"""
    registration = db.query(EventRegistration).filter(
        and_(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user_id
        )
    ).first()
    
    if not registration:
        return None
    
    registration.attendance_status = status
    db.commit()
    db.refresh(registration)
    return registration

def get_event_stats(db: Session) -> dict:
    """Get event statistics"""
    total_events = db.query(Event).count()
    upcoming_events = db.query(Event).filter(
        and_(
            Event.start_date > datetime.utcnow(),
            Event.status == EventStatus.upcoming
        )
    ).count()
    completed_events = db.query(Event).filter(
        Event.status == EventStatus.completed
    ).count()
    total_registrations = db.query(EventRegistration).count()
    
    return {
        "total_events": total_events,
        "upcoming_events": upcoming_events,
        "completed_events": completed_events,
        "total_registrations": total_registrations
    }
