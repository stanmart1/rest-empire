from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Rank(Base):
    __tablename__ = "ranks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    level = Column(Integer, unique=True, nullable=False, index=True)
    team_turnover_required = Column(Numeric(12, 2), nullable=False)
    first_leg_requirement = Column(Numeric(12, 2), nullable=False)
    second_leg_requirement = Column(Numeric(12, 2), nullable=False)
    other_legs_requirement = Column(Numeric(12, 2), nullable=False)
    bonus_amount = Column(Numeric(10, 2), default=0)
    infinity_bonus_percentage = Column(Numeric(5, 2), nullable=True)
    
    display_name = Column(String)
    icon_url = Column(String)
    color_hex = Column(String)
    description = Column(Text)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
