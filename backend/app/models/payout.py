from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class PayoutStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    processing = "processing"
    completed = "completed"
    rejected = "rejected"

class Payout(Base):
    __tablename__ = "payouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="EUR")
    status = Column(Enum(PayoutStatus), default=PayoutStatus.pending, index=True)
    payout_method = Column(String)
    idempotency_key = Column(String, unique=True, index=True, nullable=True)
    
    account_details = Column(JSON)
    processing_fee = Column(Numeric(10, 2), default=0)
    net_amount = Column(Numeric(10, 2))
    
    requested_at = Column(DateTime, default=datetime.utcnow, index=True)
    approved_at = Column(DateTime)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    completed_at = Column(DateTime)
    rejection_reason = Column(Text)
    
    external_transaction_id = Column(String)
    external_response = Column(JSON)
    
    user = relationship("User", back_populates="payouts", foreign_keys=[user_id])
    approved_by_admin = relationship("User", foreign_keys=[approved_by], overlaps="user")
