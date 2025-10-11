from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ancestor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    depth = Column(Integer, nullable=False, index=True)
    path = Column(String)
    
    total_turnover = Column(Numeric(12, 2), default=0)
    personal_turnover = Column(Numeric(12, 2), default=0)
    last_turnover_update = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", foreign_keys=[user_id])
    ancestor = relationship("User", foreign_keys=[ancestor_id])
