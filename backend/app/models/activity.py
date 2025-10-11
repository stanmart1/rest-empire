from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    entity_type = Column(String, index=True)
    entity_id = Column(Integer, index=True)
    details = Column(JSON)
    ip_address = Column(String)
    user_agent = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User")
