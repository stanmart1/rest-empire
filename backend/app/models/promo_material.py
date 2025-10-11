from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from datetime import datetime
import enum
from app.core.database import Base

class MaterialType(enum.Enum):
    presentation = "presentation"
    calculator = "calculator"
    brochure = "brochure"
    video = "video"
    image = "image"
    document = "document"

class PromoMaterial(Base):
    __tablename__ = "promo_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    material_type = Column(Enum(MaterialType), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)  # in bytes
    language = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
