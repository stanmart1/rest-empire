from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TransactionType(enum.Enum):
    purchase = "purchase"
    bonus = "bonus"
    payout = "payout"
    fee = "fee"
    refund = "refund"

class TransactionStatus(enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_type = Column(Enum(TransactionType), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="EUR")
    status = Column(Enum(TransactionStatus), default=TransactionStatus.pending, index=True)
    description = Column(Text)
    metadata = Column(JSON)
    
    payment_method = Column(String)
    payment_reference = Column(String)
    payment_gateway_response = Column(JSON)
    
    related_transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)
    
    user = relationship("User", back_populates="transactions")
    bonus = relationship("Bonus", back_populates="source_transaction", uselist=False)
