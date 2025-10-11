from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class BonusResponse(BaseModel):
    id: int
    bonus_type: str
    amount: float
    currency: str
    status: str
    level: Optional[int]
    source_user_id: Optional[int]
    rank_achieved: Optional[str]
    percentage: Optional[float]
    base_amount: Optional[float]
    created_at: datetime
    paid_date: Optional[date]
    
    class Config:
        from_attributes = True

class BonusSummary(BaseModel):
    total_bonuses: float
    unilevel_bonuses: float
    rank_bonuses: float
    infinity_bonuses: float
    pending_bonuses: float
    paid_bonuses: float

class BonusAnalytics(BaseModel):
    period: str
    total_earned: float
    by_type: dict
    top_earning_month: Optional[str]
    growth_rate: Optional[float]
