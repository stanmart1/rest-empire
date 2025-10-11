from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_admin_user, get_finance_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.payout import Payout, PayoutStatus
from app.schemas.transaction import TransactionResponse
from app.schemas.payout import PayoutResponse
from app.services.transaction_service import refund_transaction, fail_transaction
from app.services.payout_service import approve_payout, complete_payout, reject_payout
from app.utils.activity import log_activity

router = APIRouter()

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

@router.get("/transactions", response_model=List[TransactionResponse])
def admin_get_all_transactions(
    user_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all transactions with filters"""
    query = db.query(Transaction)
    
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    transactions = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return transactions

@router.post("/transactions/manual")
def admin_create_manual_transaction(
    transaction: ManualTransaction,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Create manual transaction (adjustment)"""
    user = db.query(User).filter(User.id == transaction.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create transaction
    new_transaction = Transaction(
        user_id=transaction.user_id,
        transaction_type=TransactionType[transaction.transaction_type],
        amount=transaction.amount,
        currency=transaction.currency,
        status=TransactionStatus.completed,
        description=transaction.description,
        completed_at=datetime.utcnow(),
        meta_data={"created_by_admin": admin.id}
    )
    db.add(new_transaction)
    
    # Update user balance
    if transaction.currency == "NGN":
        user.balance_ngn += transaction.amount
    elif transaction.currency == "USDT":
        user.balance_usdt += transaction.amount
    
    if transaction.amount > 0:
        user.total_earnings += transaction.amount
    
    db.commit()
    
    # Log activity
    log_activity(
        db, transaction.user_id, "manual_transaction_created",
        entity_type="transaction",
        entity_id=new_transaction.id,
        details={"admin_id": admin.id, "amount": transaction.amount}
    )
    
    return {"message": "Transaction created successfully", "transaction_id": new_transaction.id}

@router.post("/transactions/{transaction_id}/refund")
def admin_refund_transaction(
    transaction_id: int,
    refund_request: RefundRequest,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Refund a transaction"""
    success = refund_transaction(db, transaction_id, refund_request.reason)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot refund transaction")
    
    return {"message": "Transaction refunded successfully"}

@router.post("/transactions/{transaction_id}/fail")
def admin_fail_transaction(
    transaction_id: int,
    reason: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Mark transaction as failed"""
    success = fail_transaction(db, transaction_id, reason)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot fail transaction")
    
    return {"message": "Transaction marked as failed"}

@router.get("/payouts", response_model=List[PayoutResponse])
def admin_get_all_payouts(
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_finance_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all payout requests"""
    query = db.query(Payout)
    
    if user_id:
        query = query.filter(Payout.user_id == user_id)
    
    if status:
        query = query.filter(Payout.status == status)
    
    payouts = query.order_by(Payout.requested_at.desc()).offset(skip).limit(limit).all()
    
    return payouts

@router.post("/payouts/{payout_id}/approve")
def admin_approve_payout(
    payout_id: int,
    admin: User = Depends(get_finance_user),
    db: Session = Depends(get_db)
):
    """Admin: Approve a payout request"""
    success = approve_payout(db, payout_id, admin.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot approve payout")
    
    return {"message": "Payout approved successfully"}

@router.post("/payouts/{payout_id}/complete")
def admin_complete_payout(
    payout_id: int,
    completion: PayoutApproval,
    admin: User = Depends(get_finance_user),
    db: Session = Depends(get_db)
):
    """Admin: Mark payout as completed"""
    success = complete_payout(
        db,
        payout_id,
        completion.external_transaction_id,
        completion.external_response
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot complete payout")
    
    return {"message": "Payout completed successfully"}

@router.post("/payouts/{payout_id}/reject")
def admin_reject_payout(
    payout_id: int,
    rejection: PayoutRejection,
    admin: User = Depends(get_finance_user),
    db: Session = Depends(get_db)
):
    """Admin: Reject a payout request"""
    success = reject_payout(db, payout_id, admin.id, rejection.reason)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot reject payout")
    
    return {"message": "Payout rejected successfully"}
