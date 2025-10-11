from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric
from app.core.database import Base

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)  # Can be accessed by non-admin users
