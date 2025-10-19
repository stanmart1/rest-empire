from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BlogBase(BaseModel):
    title: str
    content: str
    author: str
    image_url: Optional[str] = None

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
