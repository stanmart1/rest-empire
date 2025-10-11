from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Email notifications
    email_new_team_member = Column(Boolean, default=True)
    email_bonus_earned = Column(Boolean, default=True)
    email_rank_achieved = Column(Boolean, default=True)
    email_payout_status = Column(Boolean, default=True)
    email_transaction_completed = Column(Boolean, default=True)
    email_security_alerts = Column(Boolean, default=True)
    email_marketing = Column(Boolean, default=False)
    
    # In-app notifications
    inapp_new_team_member = Column(Boolean, default=True)
    inapp_bonus_earned = Column(Boolean, default=True)
    inapp_rank_achieved = Column(Boolean, default=True)
    inapp_payout_status = Column(Boolean, default=True)
    inapp_transaction_completed = Column(Boolean, default=True)
    
    user = relationship("User", backref="notification_preferences")
