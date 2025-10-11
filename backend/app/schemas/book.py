from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    cover_image: Optional[str]
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class BookReviewResponse(BaseModel):
    id: int
    book_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
