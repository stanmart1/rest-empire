from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.services.team_service import update_team_turnover
from app.services.rank_service import calculate_user_rank
from app.services.bonus_engine import calculate_unilevel_bonus, reverse_bonuses
from app.services.activity_service import update_user_activity
from app.utils.activity import log_activity

def create_purchase_transaction(
    db: Session,
    user_id: int,
    amount: float,
    currency: str,
    payment_method: str,
    payment_reference: str = None
) -> Transaction:
    """Create a purchase transaction"""
    transaction = Transaction(
        user_id=user_id,
        transaction_type=TransactionType.purchase,
        amount=amount,
        currency=currency,
        status=TransactionStatus.pending,
        payment_method=payment_method,
        payment_reference=payment_reference,
        description=f"Purchase via {payment_method}"
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction

def complete_purchase_transaction(db: Session, transaction_id: int, gateway_response: dict = None):
    """Complete a purchase transaction and trigger bonuses"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction or transaction.status != TransactionStatus.pending:
        return False
    
    # Update transaction status
    transaction.status = TransactionStatus.completed
    transaction.completed_at = datetime.utcnow()
    if gateway_response:
        transaction.payment_gateway_response = gateway_response
    
    db.commit()
    
    # Update team turnover
    update_team_turnover(db, transaction.user_id, float(transaction.amount))
    
    # Update user activity status
    update_user_activity(db, transaction.user_id)
    
    # Calculate rank
    calculate_user_rank(db, transaction.user_id)
    
    # Calculate unilevel bonuses
    calculate_unilevel_bonus(db, transaction.id)
    
    # Log activity
    log_activity(
        db, transaction.user_id, "purchase_completed",
        entity_type="transaction",
        entity_id=transaction.id,
        details={"amount": float(transaction.amount), "currency": transaction.currency}
    )
    
    return True

def fail_transaction(db: Session, transaction_id: int, reason: str = None):
    """Mark transaction as failed"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        return False
    
    transaction.status = TransactionStatus.failed
    if reason:
        transaction.meta_data = {"failure_reason": reason}
    
    db.commit()
    
    log_activity(
        db, transaction.user_id, "transaction_failed",
        entity_type="transaction",
        entity_id=transaction.id,
        details={"reason": reason}
    )
    
    return True

def refund_transaction(db: Session, transaction_id: int, reason: str = None):
    """Refund a transaction and reverse bonuses"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction or transaction.status != TransactionStatus.completed:
        return False
    
    # Create refund transaction
    refund = Transaction(
        user_id=transaction.user_id,
        transaction_type=TransactionType.refund,
        amount=transaction.amount,
        currency=transaction.currency,
        status=TransactionStatus.completed,
        related_transaction_id=transaction.id,
        description=f"Refund for transaction #{transaction.id}",
        completed_at=datetime.utcnow(),
        meta_data={"reason": reason} if reason else None
    )
    db.add(refund)
    
    # Update original transaction
    transaction.status = TransactionStatus.cancelled
    
    # Reverse bonuses
    reverse_bonuses(db, transaction.id)
    
    # Reverse team turnover
    update_team_turnover(db, transaction.user_id, -float(transaction.amount))
    
    # Recalculate rank
    calculate_user_rank(db, transaction.user_id)
    
    db.commit()
    
    log_activity(
        db, transaction.user_id, "transaction_refunded",
        entity_type="transaction",
        entity_id=transaction.id,
        details={"reason": reason}
    )
    
    return True

def get_transaction_stats(db: Session, user_id: int) -> dict:
    """Get transaction statistics for a user"""
    # Total purchases
    total_purchases = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == TransactionType.purchase,
        Transaction.status == TransactionStatus.completed
    ).count()
    
    # Total purchase amount
    from sqlalchemy import func
    total_amount = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == TransactionType.purchase,
        Transaction.status == TransactionStatus.completed
    ).scalar() or 0
    
    # Pending transactions
    pending = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.status == TransactionStatus.pending
    ).count()
    
    return {
        "total_purchases": total_purchases,
        "total_amount": float(total_amount),
        "pending_transactions": pending
    }
