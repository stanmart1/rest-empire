from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ActivationPackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_days: Optional[int] = None
    features: Optional[List[str]] = []
    is_active: bool = True

class ActivationPackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ActivationPackageResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: float
    currency: str
    features: List[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserActivationResponse(BaseModel):
    id: int
    user_id: int
    package_id: Optional[int]
    status: str
    activation_fee: Optional[float]
    activated_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime
    package: Optional[ActivationPackageResponse]
    
    class Config:
        from_attributes = True

class ActivationRequest(BaseModel):
    package_id: int
    payment_method: str
