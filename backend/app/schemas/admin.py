from pydantic import BaseModel
from typing import Optional

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    pending_verifications: int
    total_revenue_ngn: float
    total_revenue_usdt: float
    pending_payouts: int
    total_bonuses_paid: float

class ManualTransaction(BaseModel):
    user_id: int
    amount: float
    currency: str = "NGN"
    description: str
    transaction_type: str = "bonus"

class RefundRequest(BaseModel):
    reason: str

class PayoutApproval(BaseModel):
    external_transaction_id: Optional[str] = None
    external_response: Optional[dict] = None

class PayoutRejection(BaseModel):
    reason: str
