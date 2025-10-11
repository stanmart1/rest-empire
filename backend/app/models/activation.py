from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ActivationPackage(Base):
    __tablename__ = "activation_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="EUR")
    features = Column(JSON)  # Store features as JSON array
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserActivation(Base):
    __tablename__ = "user_activations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    package_id = Column(Integer, ForeignKey("activation_packages.id"), nullable=True)
    status = Column(String(20), default="inactive", index=True)
    activation_fee = Column(Float, nullable=True)
    payment_transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    activated_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    package = relationship("ActivationPackage")
    payment_transaction = relationship("Transaction")
