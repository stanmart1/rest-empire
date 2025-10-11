from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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
