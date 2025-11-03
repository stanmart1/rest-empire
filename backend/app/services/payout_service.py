from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func
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
    account_details: dict,
    idempotency_key: str = None
) -> Payout:
    """Create a payout request with idempotency and atomic transaction"""
    import logging
    import hashlib
    from sqlalchemy import select
    
    logger = logging.getLogger(__name__)
    
    # Generate idempotency key if not provided
    if not idempotency_key:
        idempotency_key = hashlib.sha256(
            f"{user_id}:{amount}:{currency}:{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()
    
    # Check for duplicate payout (idempotency)
    existing_payout = db.query(Payout).filter(
        Payout.idempotency_key == idempotency_key
    ).first()
    
    if existing_payout:
        logger.warning(f"Duplicate payout request detected: {idempotency_key}")
        return existing_payout
    
    # Use SELECT FOR UPDATE to lock user row and prevent race conditions
    user = db.query(User).filter(User.id == user_id).with_for_update().first()
    
    if not user:
        raise ValueError("User not found")
    
    # Check KYC requirement
    kyc_required = (get_config(db, "kyc_required") or "false") == "true"
    if kyc_required and not user.kyc_verified:
        raise ValueError("KYC verification required before withdrawal")
    
    # Check withdrawal limits
    if currency == "NGN":
        daily_limit = float(get_config(db, "daily_withdrawal_limit") or 0)
        weekly_limit = float(get_config(db, "weekly_withdrawal_limit") or 0)
        monthly_limit = float(get_config(db, "monthly_withdrawal_limit") or 0)
        
        now = datetime.utcnow()
        
        if daily_limit > 0:
            daily_total = db.query(func.sum(Payout.amount)).filter(
                Payout.user_id == user_id,
                Payout.currency == "NGN",
                Payout.status.in_([PayoutStatus.pending, PayoutStatus.approved, PayoutStatus.completed]),
                Payout.created_at >= now - timedelta(days=1)
            ).scalar() or 0
            if daily_total + amount > daily_limit:
                raise ValueError(f"Daily withdrawal limit of ₦{daily_limit:,.2f} exceeded")
        
        if weekly_limit > 0:
            weekly_total = db.query(func.sum(Payout.amount)).filter(
                Payout.user_id == user_id,
                Payout.currency == "NGN",
                Payout.status.in_([PayoutStatus.pending, PayoutStatus.approved, PayoutStatus.completed]),
                Payout.created_at >= now - timedelta(days=7)
            ).scalar() or 0
            if weekly_total + amount > weekly_limit:
                raise ValueError(f"Weekly withdrawal limit of ₦{weekly_limit:,.2f} exceeded")
        
        if monthly_limit > 0:
            monthly_total = db.query(func.sum(Payout.amount)).filter(
                Payout.user_id == user_id,
                Payout.currency == "NGN",
                Payout.status.in_([PayoutStatus.pending, PayoutStatus.approved, PayoutStatus.completed]),
                Payout.created_at >= now - timedelta(days=30)
            ).scalar() or 0
            if monthly_total + amount > monthly_limit:
                raise ValueError(f"Monthly withdrawal limit of ₦{monthly_limit:,.2f} exceeded")
    
    # Validate minimum amount
    min_payout = get_minimum_payout(db, currency)
    if amount < min_payout:
        raise ValueError(f"Minimum payout is {min_payout} {currency}")
    
    # Check balance with locked row
    current_balance = 0
    if currency == "NGN":
        current_balance = float(user.balance_ngn or 0)
        if current_balance < amount:
            raise ValueError(f"Insufficient balance. Available: ₦{current_balance:,.2f}")
    elif currency == "USDT":
        current_balance = float(user.balance_usdt or 0)
        if current_balance < amount:
            raise ValueError(f"Insufficient balance. Available: ${current_balance:,.2f}")
    
    # Calculate fee and net amount
    processing_fee = calculate_processing_fee(db, amount, currency)
    net_amount = amount - processing_fee
    
    try:
        # Atomic transaction: create payout and deduct balance together
        payout = Payout(
            user_id=user_id,
            amount=amount,
            currency=currency,
            status=PayoutStatus.pending,
            payout_method=payout_method,
            account_details=account_details,
            processing_fee=processing_fee,
            net_amount=net_amount,
            idempotency_key=idempotency_key
        )
        
        db.add(payout)
        
        # Deduct from user balance (atomic with payout creation)
        if currency == "NGN":
            user.balance_ngn -= amount
            new_balance = float(user.balance_ngn)
        elif currency == "USDT":
            user.balance_usdt -= amount
            new_balance = float(user.balance_usdt)
        
        # Commit both operations atomically
        db.commit()
        db.refresh(payout)
        
        logger.info(
            f"Payout created: ID={payout.id}, User={user_id}, "
            f"Amount={amount} {currency}, New Balance={new_balance}"
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create payout: {str(e)}", exc_info=True)
        raise ValueError(f"Failed to create payout: {str(e)}")
    
    # Log activity
    log_activity(
        db, user_id, "payout_requested",
        entity_type="payout",
        entity_id=payout.id,
        details={"amount": amount, "currency": currency}
    )
    
    return payout

def approve_payout(db: Session, payout_id: int, admin_id: int) -> bool:
    """Approve a payout request with row locking"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Lock payout row to prevent concurrent approvals
    payout = db.query(Payout).filter(
        Payout.id == payout_id
    ).with_for_update().first()
    
    if not payout:
        logger.warning(f"Payout {payout_id} not found")
        return False
    
    if payout.status != PayoutStatus.pending:
        logger.warning(f"Payout {payout_id} already processed: {payout.status}")
        return False
    
    try:
        payout.status = PayoutStatus.approved
        payout.approved_at = datetime.utcnow()
        payout.approved_by = admin_id
        
        db.commit()
        logger.info(f"Payout {payout_id} approved by admin {admin_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to approve payout {payout_id}: {str(e)}")
        return False
    
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
    """Reject a payout request and refund balance atomically"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Lock both payout and user rows
    payout = db.query(Payout).filter(
        Payout.id == payout_id
    ).with_for_update().first()
    
    if not payout:
        logger.warning(f"Payout {payout_id} not found")
        return False
    
    if payout.status != PayoutStatus.pending:
        logger.warning(f"Payout {payout_id} already processed: {payout.status}")
        return False
    
    user = db.query(User).filter(
        User.id == payout.user_id
    ).with_for_update().first()
    
    if not user:
        logger.error(f"User {payout.user_id} not found for payout {payout_id}")
        return False
    
    try:
        # Atomic: reject payout and refund balance
        payout.status = PayoutStatus.rejected
        payout.rejection_reason = reason
        payout.approved_by = admin_id
        payout.approved_at = datetime.utcnow()
        
        # Refund balance
        if payout.currency == "NGN":
            user.balance_ngn += payout.amount
            new_balance = float(user.balance_ngn)
        elif payout.currency == "USDT":
            user.balance_usdt += payout.amount
            new_balance = float(user.balance_usdt)
        
        db.commit()
        logger.info(
            f"Payout {payout_id} rejected by admin {admin_id}. "
            f"Refunded {payout.amount} {payout.currency}. New balance: {new_balance}"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reject payout {payout_id}: {str(e)}")
        return False
    
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
