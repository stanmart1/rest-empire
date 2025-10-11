from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import User
from app.models.team import TeamMember
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.models.rank import Rank
from app.services.activity_service import check_user_active
from typing import List

# Unilevel percentages by level
UNILEVEL_PERCENTAGES = {
    1: 40.0,   # Direct referral
    2: 7.0,
    3: 5.0,
    4: 3.0,
    5: 3.0,
    6: 1.0,
    7: 1.0,
    8: 1.0,
    9: 1.0,
    10: 1.0,
    11: 1.0,
    12: 1.0,
    13: 1.0,
    14: 1.0,
    15: 1.0
}

def calculate_unilevel_bonus(db: Session, transaction_id: int):
    """Calculate and award unilevel bonuses for a transaction"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction or transaction.transaction_type != TransactionType.purchase:
        return
    
    purchaser_id = transaction.user_id
    amount = float(transaction.amount)
    
    # Get all ancestors up to 15 levels
    ancestors = db.query(TeamMember).filter(
        TeamMember.user_id == purchaser_id,
        TeamMember.depth > 0,
        TeamMember.depth <= 15
    ).order_by(TeamMember.depth).all()
    
    # Group by depth to handle compression
    levels = {}
    for ancestor in ancestors:
        depth = ancestor.depth
        if depth not in levels:
            levels[depth] = []
        levels[depth].append(ancestor.ancestor_id)
    
    # Calculate bonus for each level
    bonuses_created = []
    
    for level in range(1, 16):
        if level not in levels:
            continue
        
        percentage = UNILEVEL_PERCENTAGES.get(level, 0)
        if percentage == 0:
            continue
        
        # Get active members at this level (compression)
        active_member_id = None
        for member_id in levels[level]:
            if check_user_active(db, member_id):
                active_member_id = member_id
                break
        
        # If no active member at this level, skip (or implement carry-over)
        if not active_member_id:
            continue
        
        # Calculate bonus amount
        bonus_amount = amount * (percentage / 100)
        
        # Create bonus record
        bonus = Bonus(
            user_id=active_member_id,
            bonus_type=BonusType.unilevel,
            amount=bonus_amount,
            currency=transaction.currency,
            status=BonusStatus.paid,
            level=level,
            source_user_id=purchaser_id,
            source_transaction_id=transaction_id,
            percentage=percentage,
            base_amount=amount,
            paid_date=datetime.utcnow().date(),
            calculation_metadata={
                "compression_applied": active_member_id != levels[level][0]
            }
        )
        db.add(bonus)
        
        # Create transaction record
        bonus_transaction = Transaction(
            user_id=active_member_id,
            transaction_type=TransactionType.bonus,
            amount=bonus_amount,
            currency=transaction.currency,
            status=TransactionStatus.completed,
            description=f"Unilevel bonus L{level} from purchase",
            completed_at=datetime.utcnow()
        )
        db.add(bonus_transaction)
        
        # Update user balance
        user = db.query(User).filter(User.id == active_member_id).first()
        if user:
            if transaction.currency == "EUR":
                user.balance_eur += bonus_amount
            elif transaction.currency == "DBSP":
                user.balance_dbsp += bonus_amount
            user.total_earnings += bonus_amount
        
        bonuses_created.append(bonus)
    
    db.commit()
    return bonuses_created

def calculate_infinity_bonus(db: Session, month: int, year: int):
    """Calculate monthly infinity bonuses for Diamond+ ranks"""
    # Get start and end of month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    # Calculate total company volume for the month
    total_volume = db.query(Transaction).filter(
        Transaction.transaction_type == TransactionType.purchase,
        Transaction.status == TransactionStatus.completed,
        Transaction.created_at >= start_date,
        Transaction.created_at < end_date
    ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
    
    total_volume = float(total_volume)
    
    # Get all users with Diamond rank or higher
    diamond_ranks = ["Diamond", "Blue Diamond", "Green Diamond", "Purple Diamond", 
                     "Red Diamond", "Black Diamond", "Ultima Diamond", 
                     "Double Ultima Diamond", "Triple Ultima Diamond", "Billion Diamond"]
    
    eligible_users = db.query(User).filter(
        User.current_rank.in_(diamond_ranks),
        User.is_active == True
    ).all()
    
    bonuses_created = []
    
    for user in eligible_users:
        # Get rank details
        rank = db.query(Rank).filter(Rank.name == user.current_rank).first()
        if not rank or not rank.infinity_bonus_percentage:
            continue
        
        # Calculate bonus
        percentage = float(rank.infinity_bonus_percentage)
        bonus_amount = total_volume * (percentage / 100)
        
        # Create bonus record
        bonus = Bonus(
            user_id=user.id,
            bonus_type=BonusType.infinity,
            amount=bonus_amount,
            currency="EUR",
            status=BonusStatus.paid,
            rank_achieved=user.current_rank,
            percentage=percentage,
            base_amount=total_volume,
            paid_date=datetime.utcnow().date(),
            calculation_metadata={
                "month": month,
                "year": year,
                "company_volume": total_volume
            }
        )
        db.add(bonus)
        
        # Create transaction
        transaction = Transaction(
            user_id=user.id,
            transaction_type=TransactionType.bonus,
            amount=bonus_amount,
            currency="EUR",
            status=TransactionStatus.completed,
            description=f"Infinity bonus for {month}/{year}",
            completed_at=datetime.utcnow()
        )
        db.add(transaction)
        
        # Update balance
        user.balance_eur += bonus_amount
        user.total_earnings += bonus_amount
        
        bonuses_created.append(bonus)
    
    db.commit()
    return bonuses_created

def reverse_bonuses(db: Session, transaction_id: int):
    """Reverse bonuses when a transaction is refunded"""
    # Find all bonuses linked to this transaction
    bonuses = db.query(Bonus).filter(
        Bonus.source_transaction_id == transaction_id,
        Bonus.status == BonusStatus.paid
    ).all()
    
    for bonus in bonuses:
        # Update bonus status
        bonus.status = BonusStatus.cancelled
        
        # Reverse user balance
        user = db.query(User).filter(User.id == bonus.user_id).first()
        if user:
            if bonus.currency == "EUR":
                user.balance_eur -= float(bonus.amount)
            elif bonus.currency == "DBSP":
                user.balance_dbsp -= float(bonus.amount)
            user.total_earnings -= float(bonus.amount)
        
        # Create reversal transaction
        reversal = Transaction(
            user_id=bonus.user_id,
            transaction_type=TransactionType.fee,
            amount=-float(bonus.amount),
            currency=bonus.currency,
            status=TransactionStatus.completed,
            description=f"Bonus reversal for refunded transaction",
            related_transaction_id=transaction_id,
            completed_at=datetime.utcnow()
        )
        db.add(reversal)
    
    db.commit()
    return len(bonuses)
