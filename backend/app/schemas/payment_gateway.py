from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class ConfigField(BaseModel):
    key: str
    label: str
    type: str

class PaymentGatewayBase(BaseModel):
    name: str
    gateway_id: str
    config_fields: List[Dict[str, str]]

class PaymentGatewayCreate(PaymentGatewayBase):
    pass

class PaymentGatewayUpdate(BaseModel):
    name: Optional[str] = None
    is_enabled: Optional[bool] = None
    config_values: Optional[Dict[str, str]] = None

class PaymentGatewayResponse(PaymentGatewayBase):
    id: int
    is_enabled: bool
    config_values: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
