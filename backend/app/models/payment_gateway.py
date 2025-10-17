from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from datetime import datetime
from app.core.database import Base

class PaymentGateway(Base):
    __tablename__ = "payment_gateways"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    gateway_id = Column(String, unique=True, nullable=False, index=True)
    is_enabled = Column(Boolean, default=False)
    config_fields = Column(JSON, nullable=False)  # [{"key": "api_key", "label": "API Key", "type": "password"}]
    config_values = Column(JSON, default={})  # {"api_key": "value"}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
