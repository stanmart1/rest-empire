from sqlalchemy.orm import Session
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

def update_user_balance(db: Session, user_id: int, amount: float, currency: str) -> float:
    """Update user balance and total earnings - eliminates duplication"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        logger.error(f"User {user_id} not found for balance update")
        raise ValueError(f"User {user_id} not found")
    
    if currency == "NGN":
        user.balance_ngn = (user.balance_ngn or 0) + amount
        new_balance = float(user.balance_ngn)
    elif currency == "USDT":
        user.balance_usdt = (user.balance_usdt or 0) + amount
        new_balance = float(user.balance_usdt)
    else:
        raise ValueError(f"Invalid currency: {currency}")
    
    user.total_earnings = (user.total_earnings or 0) + amount
    db.flush()
    
    return new_balance
