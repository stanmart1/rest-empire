from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.transaction import TransactionResponse, RecentTransaction

router = APIRouter()

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).limit(limit).all()
    
    return transactions

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction
