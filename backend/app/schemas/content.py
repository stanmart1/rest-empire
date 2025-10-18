from pydantic import BaseModel
from datetime import datetime

class ContentBase(BaseModel):
    page: str
    content: str

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    content: str

class ContentResponse(ContentBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
