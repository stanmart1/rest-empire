from pydantic import BaseModel
from datetime import datetime

class SocialUpdate(BaseModel):
    content: str

class SocialResponse(BaseModel):
    id: int
    content: str
    updated_at: datetime

    class Config:
        from_attributes = True
