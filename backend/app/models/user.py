from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class UserRole(enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone_number = Column(String)
    gender = Column(String)
    date_of_birth = Column(DateTime)
    occupation = Column(String)
    
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_inactive = Column(Boolean, default=False)
    
    role = Column(Enum(UserRole), default=UserRole.user, index=True)
    
    sponsor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String, unique=True, index=True)
    registration_date = Column(DateTime, default=datetime.utcnow)
    
    current_rank = Column(String, default="Amber", index=True)
    rank_achieved_date = Column(DateTime)
    highest_rank_achieved = Column(String)
    
    balance_ngn = Column(Numeric(10, 2), default=0)
    balance_usdt = Column(Numeric(10, 2), default=0)
    total_earnings = Column(Numeric(10, 2), default=0)
    
    last_login = Column(DateTime)
    password_reset_token = Column(String, nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    
    last_activity_date = Column(DateTime)
    activity_status = Column(String, default="active")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    sponsor = relationship("User", remote_side=[id], backref="downline")
    transactions = relationship("Transaction", back_populates="user")
    bonuses = relationship("Bonus", back_populates="user", foreign_keys="Bonus.user_id")
    payouts = relationship("Payout", back_populates="user", foreign_keys="Payout.user_id")
    support_tickets = relationship("SupportTicket", back_populates="user", foreign_keys="SupportTicket.user_id")
