from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.transaction import TransactionResponse, RecentTransaction
from app.services.transaction_service import (
    create_purchase_transaction, complete_purchase_transaction,
    fail_transaction, get_transaction_stats
)

router = APIRouter()

class PurchaseCreate(BaseModel):
    amount: float
    currency: str = "EUR"
    payment_method: str

class TransactionStats(BaseModel):
    total_purchases: int
    total_amount: float
    pending_transactions: int

@router.post("/purchase", response_model=TransactionResponse)
def create_purchase(
    purchase: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new purchase transaction"""
    if purchase.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    if purchase.currency not in ["EUR", "USDT", "DBSP"]:
        raise HTTPException(status_code=400, detail="Invalid currency")
    
    transaction = create_purchase_transaction(
        db,
        current_user.id,
        purchase.amount,
        purchase.currency,
        purchase.payment_method
    )
    
    return transaction

@router.post("/{transaction_id}/complete")
def complete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a pending transaction (webhook/callback)"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    success = complete_purchase_transaction(db, transaction_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot complete transaction")
    
    return {"message": "Transaction completed successfully"}

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    transactions = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return transactions

@router.get("/recent", response_model=List[RecentTransaction])
def get_recent_transactions(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent transactions"""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).limit(limit).all()
    
    return transactions

@router.get("/stats", response_model=TransactionStats)
def get_user_transaction_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction statistics"""
    stats = get_transaction_stats(db, current_user.id)
    return TransactionStats(**stats)

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction details"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction
