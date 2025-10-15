from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from io import BytesIO
import qrcode
import qrcode.image.svg
import json
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.event import EventType, EventStatus
from app.schemas.event import (
    EventResponse, EventCreate, EventUpdate, EventRegistrationResponse, EventStats
)
from app.services.event_service import (
    get_events, get_event_by_id, create_event, update_event, delete_event,
    register_for_event, unregister_from_event, get_user_events,
    get_event_attendees, update_attendance_status, get_event_stats
)

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
def list_events(
    event_type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    upcoming_only: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all events"""
    events = get_events(
        db=db,
        user_id=current_user.id,
        event_type=event_type,
        status=status,
        upcoming_only=upcoming_only,
        skip=skip,
        limit=limit
    )
    
    # Add current attendees count
    for event in events:
        event.current_attendees = len(event.registrations)
    
    return events

@router.get("/my-events", response_model=List[EventResponse])
def get_my_events(
    upcoming_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get events user is registered for"""
    events = get_user_events(db, current_user.id, upcoming_only)
    
    for event in events:
        event.current_attendees = len(event.registrations)
        event.is_registered = True
    
    return events

@router.get("/stats", response_model=EventStats)
def get_events_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get event statistics"""
    return get_event_stats(db)

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get event by ID"""
    event = get_event_by_id(db, event_id, current_user.id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.current_attendees = len(event.registrations)
    return event

@router.post("/", response_model=EventResponse)
def create_new_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new event (admin only)"""
    # Check if user has admin privileges (you may need to implement role checking)
    event = create_event(db, event_data, current_user.id)
    event.current_attendees = 0
    event.is_registered = False
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_existing_event(
    event_id: int,
    event_data: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update event (admin only)"""
    event = update_event(db, event_id, event_data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.current_attendees = len(event.registrations)
    return event

@router.delete("/{event_id}")
def delete_existing_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete event (admin only)"""
    success = delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted successfully"}

@router.post("/{event_id}/register", response_model=EventRegistrationResponse)
def register_for_existing_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register for event"""
    registration = register_for_event(db, event_id, current_user.id)
    if not registration:
        raise HTTPException(
            status_code=400, 
            detail="Cannot register for this event. Check capacity, deadline, or existing registration."
        )
    
    return registration

@router.delete("/{event_id}/register")
def unregister_from_existing_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unregister from event"""
    success = unregister_from_event(db, event_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {"message": "Successfully unregistered from event"}

@router.get("/{event_id}/attendees", response_model=List[EventRegistrationResponse])
def get_event_attendees_list(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get event attendees (admin only)"""
    attendees = get_event_attendees(db, event_id)
    return attendees

@router.put("/{event_id}/attendance/{user_id}")
def update_user_attendance(
    event_id: int,
    user_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update attendance status (admin only)"""
    registration = update_attendance_status(db, event_id, user_id, status)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {"message": "Attendance status updated successfully"}

@router.get("/{event_id}/qrcode")
def get_event_qrcode(
    event_id: int,
    format: str = Query("png", regex="^(png|svg)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate QR code for event registration"""
    # Check if user is registered
    event = get_event_by_id(db, event_id, current_user.id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not event.is_registered:
        raise HTTPException(status_code=403, detail="You must be registered for this event")
    
    # Create QR code data
    qr_data = {
        "event_id": event_id,
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "event_title": event.title,
        "registration_code": f"EVT-{event_id}-USR-{current_user.id}",
        "expires_at": event.end_date.isoformat() if event.end_date else event.start_date.isoformat()
    }
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(json.dumps(qr_data))
    qr.make(fit=True)
    
    # Create filename from event title
    safe_title = "".join(c for c in event.title if c.isalnum() or c in (' ', '-', '_')).strip()
    safe_title = safe_title.replace(' ', '-')
    filename = f"{safe_title}{event_id}.{format}"
    
    # Create image based on format
    if format == "svg":
        factory = qrcode.image.svg.SvgPathImage
        img = qr.make_image(image_factory=factory)
        buffer = BytesIO()
        img.save(buffer)
        buffer.seek(0)
        return StreamingResponse(
            buffer, 
            media_type="image/svg+xml",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return StreamingResponse(
            buffer, 
            media_type="image/png",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
