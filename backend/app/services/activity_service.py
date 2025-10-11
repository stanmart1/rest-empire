from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus

def update_user_activity(db: Session, user_id: int):
    """Update user's activity status and last_activity_date"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    
    user.last_activity_date = datetime.utcnow()
    user.activity_status = "active"
    user.is_inactive = False
    db.commit()

def check_and_update_inactive_users(db: Session):
    """Check all users and mark inactive if no activity in 30 days"""
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    inactive_users = db.query(User).filter(
        User.last_activity_date < thirty_days_ago,
        User.activity_status == "active"
    ).all()
    
    for user in inactive_users:
        user.activity_status = "inactive"
        user.is_inactive = True
    
    db.commit()
    return len(inactive_users)

def reactivate_user(db: Session, user_id: int):
    """Reactivate user for 30 days"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    user.last_activity_date = datetime.utcnow()
    user.activity_status = "active"
    user.is_inactive = False
    db.commit()
    return True

def check_user_active(db: Session, user_id: int) -> bool:
    """Check if user is currently active (activity within 30 days)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.last_activity_date:
        return False
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    return user.last_activity_date >= thirty_days_ago
