from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.models.notification_preferences import NotificationPreferences
from app.schemas.notification import NotificationResponse, NotificationStats
from app.schemas.notification_preferences import NotificationPreferencesResponse, NotificationPreferencesUpdate
from app.services.notification_service import mark_as_read, mark_all_as_read, get_unread_count

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notifications"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return notifications

@router.get("/stats", response_model=NotificationStats)
def get_notification_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification statistics"""
    total = db.query(Notification).filter(Notification.user_id == current_user.id).count()
    unread = get_unread_count(db, current_user.id)
    read = total - unread
    
    return NotificationStats(
        total=total,
        unread=unread,
        read=read
    )

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    success = mark_as_read(db, notification_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    count = mark_all_as_read(db, current_user.id)
    
    return {"message": f"{count} notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}

@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notification preferences"""
    prefs = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()
    
    # Create default preferences if not exists
    if not prefs:
        prefs = NotificationPreferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs

@router.put("/preferences", response_model=NotificationPreferencesResponse)
def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's notification preferences"""
    prefs = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()
    
    # Create if not exists
    if not prefs:
        prefs = NotificationPreferences(user_id=current_user.id)
        db.add(prefs)
    
    # Update only provided fields
    update_data = preferences.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prefs, field, value)
    
    db.commit()
    db.refresh(prefs)
    
    return prefs
