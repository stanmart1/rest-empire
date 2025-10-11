from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SupportTicketCreate(BaseModel):
    subject: str
    message: str
    category: Optional[str] = None

class SupportTicketResponse(BaseModel):
    id: int
    subject: str
    category: Optional[str]
    message: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
