from sqlalchemy.orm import Session
from datetime import datetime
from app.models.notification import Notification, NotificationType

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.info,
    link: str = None
) -> Notification:
    """Create a new notification"""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        link=link
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if not notification:
        return False
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return True

def mark_all_as_read(db: Session, user_id: int) -> int:
    """Mark all notifications as read for a user"""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    return count

def get_unread_count(db: Session, user_id: int) -> int:
    """Get count of unread notifications"""
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

# Notification templates
def notify_new_team_member(db: Session, sponsor_id: int, new_member_name: str):
    """Notify user about new team member"""
    create_notification(
        db,
        sponsor_id,
        "New Team Member!",
        f"{new_member_name} has joined your team",
        NotificationType.success,
        "/team"
    )

def notify_bonus_earned(db: Session, user_id: int, bonus_type: str, amount: float):
    """Notify user about earned bonus"""
    create_notification(
        db,
        user_id,
        "Bonus Earned!",
        f"You earned €{amount:.2f} from {bonus_type} bonus",
        NotificationType.success,
        "/bonuses"
    )

def notify_rank_achieved(db: Session, user_id: int, rank_name: str):
    """Notify user about rank achievement"""
    create_notification(
        db,
        user_id,
        "Rank Achievement!",
        f"Congratulations! You've achieved {rank_name} rank",
        NotificationType.success,
        "/ranks"
    )

def notify_payout_status(db: Session, user_id: int, status: str, amount: float):
    """Notify user about payout status change"""
    messages = {
        "approved": f"Your payout request of €{amount:.2f} has been approved",
        "completed": f"Your payout of €{amount:.2f} has been completed",
        "rejected": f"Your payout request of €{amount:.2f} has been rejected"
    }
    
    create_notification(
        db,
        user_id,
        "Payout Update",
        messages.get(status, f"Payout status: {status}"),
        NotificationType.info if status == "approved" else NotificationType.success if status == "completed" else NotificationType.warning,
        "/payouts"
    )

def notify_transaction_completed(db: Session, user_id: int, amount: float):
    """Notify user about completed transaction"""
    create_notification(
        db,
        user_id,
        "Transaction Completed",
        f"Your purchase of €{amount:.2f} has been completed",
        NotificationType.success,
        "/transactions"
    )
