from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from io import BytesIO
import qrcode
import qrcode.image.svg
import json
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user, check_feature_access
from app.models.user import User
from app.models.event import EventType, EventStatus
from app.schemas.event import (
    EventResponse, EventCreate, EventUpdate, EventRegistrationResponse, EventStats, EventPaymentRequest, PublicEventRegistration
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
    public_only: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    request: Request = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
):
    """Get all events (public endpoint - returns only public events if not authenticated)"""
    from app.core.rbac import has_role
    
    # Try to get current user if authenticated
    current_user = None
    is_admin = False
    if credentials:
        try:
            current_user = get_current_user(request, credentials, db)
            is_admin = has_role(db, current_user, 'super_admin') or has_role(db, current_user, 'admin')
        except:
            pass
    
    # If not authenticated or requesting public only, filter for public events
    if not current_user or public_only:
        from app.models.event import Event
        from datetime import datetime
        
        query = db.query(Event).filter(Event.is_public == True)
        
        if event_type:
            query = query.filter(Event.event_type == event_type)
        if status:
            query = query.filter(Event.status == status)
        if upcoming_only:
            query = query.filter(Event.start_date > datetime.utcnow())
        
        events = query.offset(skip).limit(limit).all()
        for event in events:
            event.current_attendees = len(event.registrations)
            event.is_registered = False
        return events
    
    if not is_admin:
        # Check feature access for regular users
        from app.models.activation import UserActivation
        from datetime import datetime
        
        if not current_user.is_active:
            raise HTTPException(status_code=403, detail="Please activate your account to access this feature")
        
        activation = db.query(UserActivation).filter(
            UserActivation.user_id == current_user.id
        ).first()
        
        if not activation or activation.status != "active":
            raise HTTPException(status_code=403, detail="Please activate your account to access this feature")
        
        if activation.expires_at and datetime.utcnow() > activation.expires_at:
            raise HTTPException(status_code=403, detail="Your subscription has expired")
    
    events = get_events(
        db=db,
        user_id=current_user.id if current_user else None,
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
    current_user: User = Depends(check_feature_access("events")),
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
    from app.core.rbac import has_role
    
    is_admin = has_role(db, current_user, 'super_admin') or has_role(db, current_user, 'admin')
    
    if not is_admin:
        from app.models.activation import UserActivation
        from datetime import datetime
        
        if not current_user.is_active:
            raise HTTPException(status_code=403, detail="Please activate your account to access this feature")
        
        activation = db.query(UserActivation).filter(
            UserActivation.user_id == current_user.id
        ).first()
        
        if not activation or activation.status != "active":
            raise HTTPException(status_code=403, detail="Please activate your account to access this feature")
        
        if activation.expires_at and datetime.utcnow() > activation.expires_at:
            raise HTTPException(status_code=403, detail="Your subscription has expired")
    
    return get_event_stats(db)

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    current_user: User = Depends(check_feature_access("events")),
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
    current_user: User = Depends(check_feature_access("events")),
    db: Session = Depends(get_db)
):
    """Register for event (free events only)"""
    event = get_event_by_id(db, event_id, current_user.id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.is_paid:
        raise HTTPException(status_code=400, detail="This is a paid event. Please use the payment endpoint.")
    
    registration = register_for_event(db, event_id, current_user.id)
    if not registration:
        raise HTTPException(
            status_code=400, 
            detail="Cannot register for this event. Check capacity, deadline, or existing registration."
        )
    
    registration.registration_code = f"EVT-{event_id}-USR-{current_user.id}"
    return registration

@router.post("/{event_id}/register-paid", response_model=EventRegistrationResponse)
async def register_for_paid_event(
    event_id: int,
    payment_data: EventPaymentRequest,
    current_user: User = Depends(check_feature_access("events")),
    db: Session = Depends(get_db)
):
    """Register for paid event with payment"""
    from app.models.event import EventRegistration, PaymentStatus
    import json
    
    event = get_event_by_id(db, event_id, current_user.id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not event.is_paid:
        raise HTTPException(status_code=400, detail="This is a free event. Use the regular registration endpoint.")
    
    # Verify payment method is allowed
    if event.allowed_payment_methods:
        allowed_methods = json.loads(event.allowed_payment_methods)
        if payment_data.payment_method not in allowed_methods:
            raise HTTPException(status_code=400, detail="Payment method not allowed for this event")
    
    # Check if already registered
    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Determine amount based on currency
    amount = event.price_ngn if payment_data.currency == "NGN" else event.price_usdt
    if not amount:
        raise HTTPException(status_code=400, detail=f"Price not set for {payment_data.currency}")
    
    # Create registration with pending payment
    registration = EventRegistration(
        event_id=event_id,
        user_id=current_user.id,
        payment_status=PaymentStatus.pending,
        payment_method=payment_data.payment_method,
        amount_paid=amount,
        currency=payment_data.currency,
        payment_proof=payment_data.payment_proof
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    registration.registration_code = f"EVT-{event_id}-USR-{current_user.id}"
    return registration

@router.delete("/{event_id}/register")
def unregister_from_existing_event(
    event_id: int,
    current_user: User = Depends(check_feature_access("events")),
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

@router.put("/{event_id}/payment/{user_id}")
def update_payment_status(
    event_id: int,
    user_id: int,
    payment_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update payment status (admin only)"""
    from app.models.event import EventRegistration, PaymentStatus
    from datetime import datetime
    
    registration = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == user_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    registration.payment_status = PaymentStatus[payment_status]
    if payment_status == "paid":
        registration.paid_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Payment status updated successfully"}

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

@router.post("/{event_id}/scan-attendance")
def scan_attendance(
    event_id: int,
    qr_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scan QR code and mark attendance (admin only)"""
    # Verify QR data
    if qr_data.get("event_id") != event_id:
        raise HTTPException(status_code=400, detail="Invalid QR code for this event")
    
    user_id = qr_data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid QR code data")
    
    # Check expiry
    expires_at = qr_data.get("expires_at")
    if expires_at:
        try:
            expiry_date = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            if expiry_date < datetime.utcnow():
                raise HTTPException(status_code=400, detail="QR code has expired")
        except ValueError:
            pass
    
    # Update attendance
    registration = update_attendance_status(db, event_id, user_id, "attended")
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    return {
        "success": True,
        "user_name": registration.user.full_name,
        "user_email": registration.user.email,
        "attendance_status": "attended"
    }

@router.get("/public/{public_link}", response_model=EventResponse)
def get_public_event(
    public_link: str,
    db: Session = Depends(get_db)
):
    """Get public event by link"""
    event = db.query(Event).filter(
        Event.public_link == public_link,
        Event.is_public == True
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.current_attendees = len(event.registrations)
    event.is_registered = False
    return event

@router.post("/public/{public_link}/register", response_model=EventRegistrationResponse)
async def register_public_event(
    public_link: str,
    registration: PublicEventRegistration,
    db: Session = Depends(get_db)
):
    """Register for public event without account"""
    from app.models.event import EventRegistration, PaymentStatus
    from app.schemas.event import PublicEventRegistration
    import json
    
    event = db.query(Event).filter(
        Event.public_link == public_link,
        Event.is_public == True
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered with this email
    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event.id,
        EventRegistration.guest_email == registration.guest_email
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered with this email")
    
    # For paid events, validate payment method
    if event.is_paid:
        if not registration.payment_method or not registration.currency:
            raise HTTPException(status_code=400, detail="Payment method and currency required for paid events")
        
        if event.allowed_payment_methods:
            allowed_methods = json.loads(event.allowed_payment_methods)
            if registration.payment_method not in allowed_methods:
                raise HTTPException(status_code=400, detail="Payment method not allowed for this event")
        
        amount = event.price_ngn if registration.currency == "NGN" else event.price_usdt
        if not amount:
            raise HTTPException(status_code=400, detail=f"Price not set for {registration.currency}")
        
        reg = EventRegistration(
            event_id=event.id,
            guest_name=registration.guest_name,
            guest_email=registration.guest_email,
            guest_phone=registration.guest_phone,
            payment_status=PaymentStatus.pending,
            payment_method=registration.payment_method,
            amount_paid=amount,
            currency=registration.currency,
            payment_proof=registration.payment_proof
        )
    else:
        reg = EventRegistration(
            event_id=event.id,
            guest_name=registration.guest_name,
            guest_email=registration.guest_email,
            guest_phone=registration.guest_phone,
            payment_status=PaymentStatus.paid
        )
    
    db.add(reg)
    db.commit()
    db.refresh(reg)
    
    reg.registration_code = f"EVT-{event.id}-GUEST-{reg.id}"
    return reg
