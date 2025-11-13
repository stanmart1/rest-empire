from pydantic import BaseModel
from typing import Optional

class TeamMemberBase(BaseModel):
    name: str
    position: str
    description: str
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class TeamMember(TeamMemberBase):
    id: int

    class Config:
        from_attributes = True
