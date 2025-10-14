from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal

class CryptoSignalCreate(BaseModel):
    coin: str
    signal_type: str
    entry_price: Decimal
    target_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    description: Optional[str] = None
    is_published: bool = False

class CryptoSignalUpdate(BaseModel):
    current_price: Optional[Decimal] = None
    target_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    status: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None

class CryptoSignalResponse(BaseModel):
    id: int
    coin: str
    signal_type: str
    entry_price: Decimal
    target_price: Optional[Decimal]
    stop_loss: Optional[Decimal]
    current_price: Optional[Decimal]
    status: str
    description: Optional[str]
    is_published: bool
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True
