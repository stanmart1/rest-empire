from pydantic import BaseModel
from datetime import datetime

class ContactUpdate(BaseModel):
    content: str

class ContactResponse(BaseModel):
    id: int
    content: str
    updated_at: datetime

    class Config:
        from_attributes = True
