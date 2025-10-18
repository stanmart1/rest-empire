from pydantic import BaseModel
from datetime import datetime

class AboutUpdate(BaseModel):
    content: str

class AboutResponse(BaseModel):
    id: int
    content: str
    updated_at: datetime

    class Config:
        from_attributes = True
