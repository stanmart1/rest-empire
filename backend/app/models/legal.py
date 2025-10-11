from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_type = Column(String, nullable=False, index=True)
    version = Column(String)
    accepted_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
