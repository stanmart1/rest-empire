from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class BonusType(enum.Enum):
    rank_bonus = "rank_bonus"
    unilevel = "unilevel"
    infinity = "infinity"
    direct = "direct"

class BonusStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    cancelled = "cancelled"

class Bonus(Base):
    __tablename__ = "bonuses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    bonus_type = Column(Enum(BonusType), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="EUR")
    calculation_date = Column(Date, default=datetime.utcnow, index=True)
    paid_date = Column(Date, nullable=True)
    status = Column(Enum(BonusStatus), default=BonusStatus.pending, index=True)
    
    level = Column(Integer)
    source_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    source_transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    rank_achieved = Column(String)
    
    percentage = Column(Numeric(5, 2))
    base_amount = Column(Numeric(10, 2))
    calculation_metadata = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="bonuses", foreign_keys=[user_id])
    source_user = relationship("User", foreign_keys=[source_user_id])
    source_transaction = relationship("Transaction", back_populates="bonus")
