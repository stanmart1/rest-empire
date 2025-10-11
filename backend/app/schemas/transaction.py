from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionResponse(BaseModel):
    id: int
    transaction_type: str
    amount: float
    currency: str
    status: str
    description: Optional[str]
    payment_method: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class RecentTransaction(BaseModel):
    id: int
    transaction_type: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
