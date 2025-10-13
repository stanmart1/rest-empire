from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class VerificationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class UserVerification(Base):
    __tablename__ = "user_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Personal Info
    full_name = Column(String, nullable=False)
    gender = Column(String)
    date_of_birth = Column(DateTime)
    place_of_birth = Column(String)
    nationality = Column(String)
    
    # Document Info
    document_type = Column(String, nullable=False)  # passport, drivers_license, nin
    document_number = Column(String, nullable=False)
    document_issue_date = Column(DateTime)
    document_expiry_date = Column(DateTime)
    document_file_path = Column(String)
    
    # Address
    address_country = Column(String)
    address_city = Column(String)
    address_street = Column(String)
    address_zip = Column(String)
    
    # Business
    business_name = Column(String)
    business_type = Column(String)
    business_reg_number = Column(String)
    
    # Status
    status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.pending)
    rejection_reason = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="verifications")
