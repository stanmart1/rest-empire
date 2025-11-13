from sqlalchemy import Column, Integer, String, Text, Boolean
from app.core.database import Base

class TeamMember(Base):
    __tablename__ = "about_team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
