from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class EmailChange(BaseModel):
    new_email: EmailStr
    password: str

class DashboardStats(BaseModel):
    balance_ngn: float
    balance_usdt: float
    total_earnings: float
    current_rank: str
    team_size: int
    first_line_count: int
    pending_payouts: float
    recent_earnings_30d: float
    
class ReferralInfo(BaseModel):
    referral_code: str
    referral_url: str
    total_referrals: int
    active_referrals: int

class SponsorInfo(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    current_rank: str
    registration_date: datetime
    
    class Config:
        from_attributes = True
