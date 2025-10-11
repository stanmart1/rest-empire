from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PayoutRequest(BaseModel):
    amount: float
    currency: str  # NGN or USDT
    payout_method: str  # bank_transfer or crypto
    account_details: dict

class BankAccountDetails(BaseModel):
    account_number: str
    account_name: str
    bank_name: str
    bank_code: Optional[str] = None

class CryptoAccountDetails(BaseModel):
    wallet_address: str
    network: str = "TRC20"

class PayoutResponse(BaseModel):
    id: int
    amount: float
    currency: str
    status: str
    payout_method: str
    processing_fee: float
    net_amount: float
    requested_at: datetime
    approved_at: Optional[datetime]
    completed_at: Optional[datetime]
    rejection_reason: Optional[str]
    
    class Config:
        from_attributes = True

class PayoutStats(BaseModel):
    total_payouts: float
    pending_payouts: float
    completed_payouts: float
    rejected_payouts: float
    available_balance_ngn: float
    available_balance_usdt: float
    minimum_payout: float
