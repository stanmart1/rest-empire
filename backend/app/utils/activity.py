from sqlalchemy.orm import Session
from app.models.activity import ActivityLog
from typing import Optional

def log_activity(
    db: Session,
    user_id: int,
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    activity = ActivityLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(activity)
    db.commit()
