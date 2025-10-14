from sqlalchemy import Column, Integer, String, Numeric, DateTime, Enum, Text, Boolean
from datetime import datetime
import enum
from app.core.database import Base

class SignalType(enum.Enum):
    buy = "buy"
    sell = "sell"
    hold = "hold"

class SignalStatus(enum.Enum):
    active = "active"
    closed = "closed"
    cancelled = "cancelled"

class CryptoSignal(Base):
    __tablename__ = "crypto_signals"

    id = Column(Integer, primary_key=True, index=True)
    coin = Column(String, nullable=False, index=True)
    signal_type = Column(Enum(SignalType), nullable=False)
    entry_price = Column(Numeric(20, 8), nullable=False)
    target_price = Column(Numeric(20, 8))
    stop_loss = Column(Numeric(20, 8))
    current_price = Column(Numeric(20, 8))
    status = Column(Enum(SignalStatus), default=SignalStatus.active, index=True)
    description = Column(Text)
    is_published = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime)
