from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class About(Base):
    __tablename__ = "about"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
