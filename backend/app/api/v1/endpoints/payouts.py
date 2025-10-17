from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user, check_feature_access
from app.models.user import User
from app.models.payout import Payout, PayoutStatus
from app.schemas.payout import (
    PayoutRequest, PayoutResponse,
    BankAccountDetails, CryptoAccountDetails
)
from app.services.payout_service import create_payout_request

router = APIRouter()

@router.post("/request", response_model=PayoutResponse)
def request_payout(
    payout: PayoutRequest,
    current_user: User = Depends(check_feature_access("payouts")),
    db: Session = Depends(get_db)
):
    """Request a payout"""
    # Validate currency
    if payout.currency not in ["NGN", "USDT"]:
        raise HTTPException(status_code=400, detail="Currency must be NGN or USDT")
    
    # Validate payout method
    if payout.payout_method not in ["bank_transfer", "crypto"]:
        raise HTTPException(status_code=400, detail="Invalid payout method")
    
    # Validate method matches currency
    if payout.currency == "NGN" and payout.payout_method != "bank_transfer":
        raise HTTPException(status_code=400, detail="NGN only supports bank transfer")
    
    if payout.currency == "USDT" and payout.payout_method != "crypto":
        raise HTTPException(status_code=400, detail="USDT only supports crypto")
    
    try:
        payout_record = create_payout_request(
            db,
            current_user.id,
            payout.amount,
            payout.currency,
            payout.payout_method,
            payout.account_details
        )
        return payout_record
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[PayoutResponse])
def get_payouts(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's payout history"""
    query = db.query(Payout).filter(Payout.user_id == current_user.id)
    
    if status:
        query = query.filter(Payout.status == status)
    
    payouts = query.order_by(Payout.requested_at.desc()).offset(skip).limit(limit).all()
    
    return payouts

@router.get("/{payout_id}", response_model=PayoutResponse)
def get_payout_details(
    payout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payout details"""
    payout = db.query(Payout).filter(
        Payout.id == payout_id,
        Payout.user_id == current_user.id
    ).first()
    
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    return payout

@router.get("/methods/info")
def get_payout_methods():
    """Get available payout methods and requirements"""
    return {
        "methods": [
            {
                "id": "bank_transfer",
                "name": "Bank Transfer",
                "currency": "NGN",
                "minimum": 5000,
                "processing_fee": "1.5%",
                "processing_time": "1-3 business days",
                "required_fields": ["account_number", "account_name", "bank_name"]
            },
            {
                "id": "crypto",
                "name": "Cryptocurrency (USDT)",
                "currency": "USDT",
                "minimum": 10,
                "processing_fee": "2%",
                "processing_time": "Instant - 1 hour",
                "network": "TRC20",
                "required_fields": ["wallet_address", "network"]
            }
        ]
    }
