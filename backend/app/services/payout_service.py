from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.payout import Payout, PayoutStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.services.config_service import get_config
from app.utils.activity import log_activity

def get_minimum_payout(db: Session, currency: str) -> float:
    """Get minimum payout amount from config"""
    if currency == "NGN":
        return float(get_config(db, "min_payout_ngn"))
    elif currency == "USDT":
        return float(get_config(db, "min_payout_usdt"))
    return 0

def get_processing_fee_percentage(db: Session, currency: str) -> float:
    """Get processing fee percentage from config"""
    if currency == "NGN":
        return float(get_config(db, "payout_fee_ngn"))
    elif currency == "USDT":
        return float(get_config(db, "payout_fee_usdt"))
    return 0

def calculate_processing_fee(db: Session, amount: float, currency: str) -> float:
    """Calculate processing fee"""
    fee_percentage = get_processing_fee_percentage(db, currency)
    return amount * (fee_percentage / 100)

def create_payout_request(
    db: Session,
    user_id: int,
    amount: float,
    currency: str,
    payout_method: str,
    account_details: dict
) -> Payout:
    """Create a payout request"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise ValueError("User not found")
    
    # Validate minimum amount
    min_payout = get_minimum_payout(db, currency)
    if amount < min_payout:
        raise ValueError(f"Minimum payout is {min_payout} {currency}")
    
    # Check balance
    if currency == "NGN":
        if user.balance_ngn < amount:
            raise ValueError("Insufficient balance")
    elif currency == "USDT":
        if user.balance_usdt < amount:
            raise ValueError("Insufficient balance")
    
    # Calculate fee and net amount
    processing_fee = calculate_processing_fee(db, amount, currency)
    net_amount = amount - processing_fee
    
    # Create payout
    payout = Payout(
        user_id=user_id,
        amount=amount,
        currency=currency,
        status=PayoutStatus.pending,
        payout_method=payout_method,
        account_details=account_details,
        processing_fee=processing_fee,
        net_amount=net_amount
    )
    
    db.add(payout)
    
    # Deduct from user balance (hold)
    if currency == "NGN":
        user.balance_ngn -= amount
    elif currency == "USDT":
        user.balance_usdt -= amount
    
    db.commit()
    db.refresh(payout)
    
    # Log activity
    log_activity(
        db, user_id, "payout_requested",
        entity_type="payout",
        entity_id=payout.id,
        details={"amount": amount, "currency": currency}
    )
    
    return payout

def approve_payout(db: Session, payout_id: int, admin_id: int) -> bool:
    """Approve a payout request"""
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    
    if not payout or payout.status != PayoutStatus.pending:
        return False
    
    payout.status = PayoutStatus.approved
    payout.approved_at = datetime.utcnow()
    payout.approved_by = admin_id
    
    db.commit()
    
    log_activity(
        db, payout.user_id, "payout_approved",
        entity_type="payout",
        entity_id=payout.id,
        details={"admin_id": admin_id}
    )
    
    return True

def complete_payout(
    db: Session,
    payout_id: int,
    external_transaction_id: str = None,
    external_response: dict = None
) -> bool:
    """Mark payout as completed"""
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    
    if not payout or payout.status != PayoutStatus.approved:
        return False
    
    payout.status = PayoutStatus.completed
    payout.completed_at = datetime.utcnow()
    payout.external_transaction_id = external_transaction_id
    payout.external_response = external_response
    
    # Create transaction record
    transaction = Transaction(
        user_id=payout.user_id,
        transaction_type=TransactionType.withdrawal,
        amount=-payout.amount,
        currency=payout.currency,
        status=TransactionStatus.completed,
        description=f"Payout via {payout.payout_method}",
        completed_at=datetime.utcnow()
    )
    db.add(transaction)
    
    db.commit()
    
    log_activity(
        db, payout.user_id, "payout_completed",
        entity_type="payout",
        entity_id=payout.id
    )
    
    return True

def reject_payout(db: Session, payout_id: int, admin_id: int, reason: str) -> bool:
    """Reject a payout request and refund balance"""
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    
    if not payout or payout.status != PayoutStatus.pending:
        return False
    
    payout.status = PayoutStatus.rejected
    payout.rejection_reason = reason
    payout.approved_by = admin_id
    payout.approved_at = datetime.utcnow()
    
    # Refund balance
    user = db.query(User).filter(User.id == payout.user_id).first()
    if user:
        if payout.currency == "NGN":
            user.balance_ngn += payout.amount
        elif payout.currency == "USDT":
            user.balance_usdt += payout.amount
    
    db.commit()
    
    log_activity(
        db, payout.user_id, "payout_rejected",
        entity_type="payout",
        entity_id=payout.id,
        details={"reason": reason, "admin_id": admin_id}
    )
    
    return True

def get_payout_stats(db: Session, user_id: int) -> dict:
    """Get payout statistics for user"""
    from sqlalchemy import func
    
    user = db.query(User).filter(User.id == user_id).first()
    
    # Total payouts
    total = db.query(func.sum(Payout.amount)).filter(
        Payout.user_id == user_id,
        Payout.status == PayoutStatus.completed
    ).scalar() or 0
    
    # Pending payouts
    pending = db.query(func.sum(Payout.amount)).filter(
        Payout.user_id == user_id,
        Payout.status.in_([PayoutStatus.pending, PayoutStatus.approved])
    ).scalar() or 0
    
    # Completed payouts
    completed = db.query(func.sum(Payout.amount)).filter(
        Payout.user_id == user_id,
        Payout.status == PayoutStatus.completed
    ).scalar() or 0
    
    # Rejected payouts
    rejected = db.query(func.sum(Payout.amount)).filter(
        Payout.user_id == user_id,
        Payout.status == PayoutStatus.rejected
    ).scalar() or 0
    
    return {
        "total_payouts": float(total),
        "pending_payouts": float(pending),
        "completed_payouts": float(completed),
        "rejected_payouts": float(rejected),
        "available_balance_ngn": float(user.balance_ngn) if user else 0,
        "available_balance_usdt": float(user.balance_usdt) if user else 0,
        "minimum_payout": {
            "NGN": get_minimum_payout(db, "NGN"),
            "USDT": get_minimum_payout(db, "USDT")
        }
    }
