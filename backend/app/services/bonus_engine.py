from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import User
from app.models.team import TeamMember
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.models.rank import Rank
from app.services.activity_service import check_user_active
from app.services.config_service import get_config
from typing import List
import json

def get_unilevel_percentages(db: Session) -> dict:
    """Get unilevel percentages from database config"""
    config_str = get_config(db, "unilevel_percentages")
    if config_str:
        percentages_list = json.loads(config_str)
        return {i + 1: percentages_list[i] for i in range(len(percentages_list))}
    return {i: 0 for i in range(1, 16)}

def is_unilevel_enabled(db: Session) -> bool:
    """Check if unilevel bonus is enabled"""
    return get_config(db, "unilevel_enabled") == "true"

def is_infinity_enabled(db: Session) -> bool:
    """Check if infinity bonus is enabled"""
    return get_config(db, "infinity_enabled") == "true"

def calculate_unilevel_bonus(db: Session, transaction_id: int):
    """Calculate and award unilevel bonuses for a transaction"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        if not is_unilevel_enabled(db):
            return []
        
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
        
        if not transaction or transaction.transaction_type != TransactionType.purchase:
            logger.warning(f"Invalid transaction {transaction_id} for bonus calculation")
            return []
        
        purchaser_id = transaction.user_id
        amount = float(transaction.amount)
        
        UNILEVEL_PERCENTAGES = get_unilevel_percentages(db)
        
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
            
            try:
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
                from app.utils.balance_helpers import update_user_balance
                try:
                    new_balance = update_user_balance(db, active_member_id, bonus_amount, transaction.currency)
                except ValueError as e:
                    logger.error(f"Balance update failed: {str(e)}")
                    continue
                
                user = db.query(User).filter(User.id == active_member_id).first()
                if user:
                    
                    # Send bonus earned email (non-blocking)
                    try:
                        import asyncio
                        from app.services.email_service import send_bonus_earned_email
                        asyncio.create_task(send_bonus_earned_email(
                            user.email,
                            f"Unilevel Level {level}",
                            float(bonus_amount),
                            new_balance,
                            db
                        ))
                    except Exception as e:
                        logger.error(f"Failed to send bonus email to {user.email}: {str(e)}")
                
                bonuses_created.append(bonus)
                
            except Exception as e:
                logger.error(f"Failed to create bonus for user {active_member_id} at level {level}: {str(e)}", exc_info=True)
                # Continue with other levels even if one fails
                continue
        
        db.commit()
        logger.info(f"Created {len(bonuses_created)} bonuses for transaction {transaction_id}")
        return bonuses_created
        
    except Exception as e:
        logger.error(f"Critical error in calculate_unilevel_bonus for transaction {transaction_id}: {str(e)}", exc_info=True)
        db.rollback()
        return []

def calculate_infinity_bonus(db: Session, month: int, year: int):
    """Calculate monthly infinity bonuses for Diamond+ ranks"""
    from app.utils.balance_helpers import update_user_balance
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        if not is_infinity_enabled(db):
            return []
        
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        total_volume = db.query(Transaction).filter(
            Transaction.transaction_type == TransactionType.purchase,
            Transaction.status == TransactionStatus.completed,
            Transaction.created_at >= start_date,
            Transaction.created_at < end_date
        ).with_entities(db.func.sum(Transaction.amount)).scalar() or 0
        
        total_volume = float(total_volume)
        
        diamond_ranks = ["Diamond", "Blue Diamond", "Green Diamond", "Purple Diamond", 
                         "Red Diamond", "Black Diamond", "Ultima Diamond", 
                         "Double Ultima Diamond", "Triple Ultima Diamond", "Billion Diamond"]
        
        eligible_users = db.query(User).filter(
            User.current_rank.in_(diamond_ranks),
            User.is_active == True
        ).all()
        
        bonuses_created = []
        
        for user in eligible_users:
            try:
                rank = db.query(Rank).filter(Rank.name == user.current_rank).first()
                if not rank or not rank.infinity_bonus_percentage:
                    continue
                
                percentage = float(rank.infinity_bonus_percentage)
                bonus_amount = total_volume * (percentage / 100)
                
                bonus = Bonus(
                    user_id=user.id,
                    bonus_type=BonusType.infinity,
                    amount=bonus_amount,
                    currency="NGN",
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
                
                transaction = Transaction(
                    user_id=user.id,
                    transaction_type=TransactionType.bonus,
                    amount=bonus_amount,
                    currency="NGN",
                    status=TransactionStatus.completed,
                    description=f"Infinity bonus for {month}/{year}",
                    completed_at=datetime.utcnow()
                )
                db.add(transaction)
                
                update_user_balance(db, user.id, bonus_amount, "NGN")
                bonuses_created.append(bonus)
                
            except Exception as e:
                logger.error(f"Failed to create infinity bonus for user {user.id}: {str(e)}")
                continue
        
        db.commit()
        logger.info(f"Created {len(bonuses_created)} infinity bonuses for {month}/{year}")
        return bonuses_created
        
    except Exception as e:
        logger.error(f"Critical error in calculate_infinity_bonus: {str(e)}", exc_info=True)
        db.rollback()
        return []

def reverse_bonuses(db: Session, transaction_id: int):
    """Reverse bonuses when a transaction is refunded"""
    from app.utils.balance_helpers import update_user_balance
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        bonuses = db.query(Bonus).filter(
            Bonus.source_transaction_id == transaction_id,
            Bonus.status == BonusStatus.paid
        ).all()
        
        for bonus in bonuses:
            try:
                bonus.status = BonusStatus.cancelled
                
                # Reverse balance (negative amount)
                update_user_balance(db, bonus.user_id, -float(bonus.amount), bonus.currency)
                
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
                
            except Exception as e:
                logger.error(f"Failed to reverse bonus {bonus.id}: {str(e)}")
                continue
        
        db.commit()
        logger.info(f"Reversed {len(bonuses)} bonuses for transaction {transaction_id}")
        return len(bonuses)
        
    except Exception as e:
        logger.error(f"Critical error in reverse_bonuses: {str(e)}", exc_info=True)
        db.rollback()
        return 0
