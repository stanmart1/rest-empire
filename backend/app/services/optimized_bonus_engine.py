from sqlalchemy.orm import Session
from sqlalchemy import text, func, and_
from datetime import datetime, timedelta
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.services.optimized_team_service import OptimizedTeamService
from app.services.config_service import get_config
from typing import List, Dict, Tuple
import logging
import json

logger = logging.getLogger(__name__)

def get_unilevel_percentages(db: Session) -> dict:
    """Get unilevel percentages from database config"""
    config_str = get_config(db, "unilevel_percentages")
    if config_str:
        percentages_list = json.loads(config_str)
        return {i + 1: percentages_list[i] for i in range(len(percentages_list))}
    return {i: 0 for i in range(1, 16)}

def get_rank_bonus_amounts(db: Session) -> dict:
    """Get rank bonus amounts from database config"""
    config_str = get_config(db, "rank_bonus_amounts")
    if config_str:
        return json.loads(config_str)
    return {}

def is_unilevel_enabled(db: Session) -> bool:
    return get_config(db, "unilevel_enabled") == "true"

def is_rank_bonus_enabled(db: Session) -> bool:
    return get_config(db, "rank_bonus_enabled") == "true"

def is_infinity_enabled(db: Session) -> bool:
    return get_config(db, "infinity_enabled") == "true"

class OptimizedBonusEngine:
    
    @staticmethod
    def calculate_unilevel_bonuses_batch(db: Session, transaction_ids: List[int]) -> List[Bonus]:
        """Process multiple transactions for unilevel bonuses efficiently"""
        if not transaction_ids or not is_unilevel_enabled(db):
            return []
        
        UNILEVEL_PERCENTAGES = get_unilevel_percentages(db)
        
        # Get all transactions with user data in single query
        transactions = db.query(
            Transaction.id,
            Transaction.user_id,
            Transaction.amount,
            Transaction.currency
        ).filter(
            Transaction.id.in_(transaction_ids),
            Transaction.transaction_type == TransactionType.purchase,
            Transaction.status == TransactionStatus.completed
        ).all()
        
        if not transactions:
            return []
        
        # Get active ancestors for all purchasers
        purchaser_ids = [t.user_id for t in transactions]
        ancestors_map = OptimizedTeamService.get_active_ancestors_batch(db, purchaser_ids, 15)
        
        bonuses_to_create = []
        balance_updates = {}
        
        for transaction in transactions:
            purchaser_id = transaction.user_id
            amount = float(transaction.amount)
            
            ancestors = ancestors_map.get(purchaser_id, [])
            
            # Group ancestors by level for compression
            level_ancestors = {}
            for i, ancestor_id in enumerate(ancestors[:15], 1):
                if i not in level_ancestors:
                    level_ancestors[i] = []
                level_ancestors[i].append(ancestor_id)
            
            # Calculate bonuses for each level
            for level in range(1, 16):
                if level not in level_ancestors:
                    continue
                
                percentage = UNILEVEL_PERCENTAGES.get(level, 0)
                if percentage == 0:
                    continue
                
                # Use first active ancestor (compression already handled)
                recipient_id = level_ancestors[level][0]
                bonus_amount = amount * (percentage / 100)
                
                # Prepare bonus record
                bonuses_to_create.append({
                    'user_id': recipient_id,
                    'bonus_type': BonusType.unilevel,
                    'amount': bonus_amount,
                    'currency': transaction.currency,
                    'status': BonusStatus.paid,
                    'level': level,
                    'source_user_id': purchaser_id,
                    'source_transaction_id': transaction.id,
                    'percentage': percentage,
                    'base_amount': amount,
                    'paid_date': datetime.utcnow().date(),
                    'calculation_date': datetime.utcnow().date(),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                })
                
                # Accumulate balance updates
                if recipient_id not in balance_updates:
                    balance_updates[recipient_id] = {'eur': 0, 'dbsp': 0, 'usdt': 0}
                
                currency_key = transaction.currency.lower()
                if currency_key in balance_updates[recipient_id]:
                    balance_updates[recipient_id][currency_key] += bonus_amount
        
        # Bulk insert bonuses
        if bonuses_to_create:
            db.execute(
                text("""
                    INSERT INTO bonuses (
                        user_id, bonus_type, amount, currency, status, level,
                        source_user_id, source_transaction_id, percentage, base_amount,
                        paid_date, calculation_date, created_at, updated_at
                    ) VALUES (
                        :user_id, :bonus_type, :amount, :currency, :status, :level,
                        :source_user_id, :source_transaction_id, :percentage, :base_amount,
                        :paid_date, :calculation_date, :created_at, :updated_at
                    )
                """),
                bonuses_to_create
            )
        
        # Bulk update user balances
        OptimizedBonusEngine._bulk_update_balances(db, balance_updates)
        
        db.commit()
        logger.info(f"Created {len(bonuses_to_create)} unilevel bonuses for {len(transactions)} transactions")
        
        return bonuses_to_create
    
    @staticmethod
    def _bulk_update_balances(db: Session, balance_updates: Dict[int, Dict[str, float]]):
        """Efficiently update user balances in batch"""
        if not balance_updates:
            return
        
        # Prepare update statements for each currency
        for user_id, balances in balance_updates.items():
            updates = []
            total_earnings_update = sum(balances.values())
            
            if balances['eur'] > 0:
                updates.append(f"balance_eur = balance_eur + {balances['eur']}")
            if balances['dbsp'] > 0:
                updates.append(f"balance_dbsp = balance_dbsp + {balances['dbsp']}")
            if balances['usdt'] > 0:
                updates.append(f"balance_usdt = balance_usdt + {balances['usdt']}")
            
            if updates:
                updates.append(f"total_earnings = total_earnings + {total_earnings_update}")
                update_sql = f"UPDATE users SET {', '.join(updates)} WHERE id = {user_id}"
                db.execute(text(update_sql))
    
    @staticmethod
    def calculate_rank_bonuses_batch(db: Session, user_rank_changes: List[Tuple[int, str, str]]) -> List[Bonus]:
        """Process rank achievements for multiple users efficiently"""
        if not user_rank_changes or not is_rank_bonus_enabled(db):
            return []
        
        # Get rank bonus amounts from config (not from ranks table)
        rank_bonus_map = get_rank_bonus_amounts(db)
        if not rank_bonus_map:
            return []
        
        bonuses_to_create = []
        balance_updates = {}
        
        for user_id, old_rank, new_rank in user_rank_changes:
            bonus_amount = rank_bonus_map.get(new_rank, 0)
            
            if bonus_amount > 0:
                bonuses_to_create.append({
                    'user_id': user_id,
                    'bonus_type': BonusType.rank_bonus,
                    'amount': bonus_amount,
                    'currency': 'EUR',
                    'status': BonusStatus.paid,
                    'rank_achieved': new_rank,
                    'paid_date': datetime.utcnow().date(),
                    'calculation_date': datetime.utcnow().date(),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                })
                
                if user_id not in balance_updates:
                    balance_updates[user_id] = {'eur': 0, 'dbsp': 0, 'usdt': 0}
                balance_updates[user_id]['eur'] += bonus_amount
        
        # Bulk operations
        if bonuses_to_create:
            db.execute(
                text("""
                    INSERT INTO bonuses (
                        user_id, bonus_type, amount, currency, status, rank_achieved,
                        paid_date, calculation_date, created_at, updated_at
                    ) VALUES (
                        :user_id, :bonus_type, :amount, :currency, :status, :rank_achieved,
                        :paid_date, :calculation_date, :created_at, :updated_at
                    )
                """),
                bonuses_to_create
            )
        
        OptimizedBonusEngine._bulk_update_balances(db, balance_updates)
        db.commit()
        
        # Send rank achievement emails
        for user_id, old_rank, new_rank in user_rank_changes:
            bonus_amount = rank_bonus_map.get(new_rank, 0)
            if bonus_amount > 0:
                try:
                    from app.models.user import User
                    from app.models.team import TeamMember
                    import asyncio
                    from app.services.email_service import send_rank_achievement_email
                    
                    user = db.query(User).filter(User.id == user_id).first()
                    if user:
                        # Get team stats
                        team_size = db.query(TeamMember).filter(TeamMember.ancestor_id == user_id).count()
                        total_turnover = float(user.total_earnings or 0)
                        
                        asyncio.create_task(send_rank_achievement_email(
                            user.email,
                            user.full_name or "User",
                            new_rank,
                            float(bonus_amount),
                            total_turnover,
                            team_size,
                            db
                        ))
                except Exception as e:
                    print(f"Failed to send rank achievement email: {e}")
        
        logger.info(f"Created {len(bonuses_to_create)} rank bonuses")
        return bonuses_to_create
    
    @staticmethod
    def calculate_infinity_bonus_optimized(db: Session, month: int, year: int) -> List[Bonus]:
        """Optimized infinity bonus calculation with single query"""
        if not is_infinity_enabled(db):
            return []
        
        start_date = datetime(year, month, 1)
        end_date = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
        
        # Get company volume and eligible users in single query
        infinity_query = text("""
            WITH company_volume AS (
                SELECT COALESCE(SUM(amount), 0) as total_volume
                FROM transactions 
                WHERE transaction_type = 'purchase' 
                AND status = 'completed'
                AND created_at >= :start_date 
                AND created_at < :end_date
            ),
            eligible_users AS (
                SELECT 
                    u.id,
                    u.current_rank,
                    r.infinity_bonus_percentage
                FROM users u
                JOIN ranks r ON u.current_rank = r.name
                WHERE u.is_active = true 
                AND r.infinity_bonus_percentage > 0
            )
            SELECT 
                eu.id as user_id,
                eu.current_rank,
                eu.infinity_bonus_percentage,
                cv.total_volume,
                (cv.total_volume * eu.infinity_bonus_percentage / 100) as bonus_amount
            FROM eligible_users eu
            CROSS JOIN company_volume cv
            WHERE cv.total_volume > 0
        """)
        
        result = db.execute(infinity_query, {
            "start_date": start_date,
            "end_date": end_date
        }).fetchall()
        
        if not result:
            return []
        
        bonuses_to_create = []
        balance_updates = {}
        
        for row in result:
            bonuses_to_create.append({
                'user_id': row.user_id,
                'bonus_type': BonusType.infinity,
                'amount': float(row.bonus_amount),
                'currency': 'EUR',
                'status': BonusStatus.paid,
                'rank_achieved': row.current_rank,
                'percentage': float(row.infinity_bonus_percentage),
                'base_amount': float(row.total_volume),
                'paid_date': datetime.utcnow().date(),
                'calculation_date': datetime.utcnow().date(),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'calculation_metadata': {
                    'month': month,
                    'year': year,
                    'company_volume': float(row.total_volume)
                }
            })
            
            if row.user_id not in balance_updates:
                balance_updates[row.user_id] = {'eur': 0, 'dbsp': 0, 'usdt': 0}
            balance_updates[row.user_id]['eur'] += float(row.bonus_amount)
        
        # Bulk operations
        if bonuses_to_create:
            db.execute(
                text("""
                    INSERT INTO bonuses (
                        user_id, bonus_type, amount, currency, status, rank_achieved,
                        percentage, base_amount, paid_date, calculation_date,
                        created_at, updated_at, calculation_metadata
                    ) VALUES (
                        :user_id, :bonus_type, :amount, :currency, :status, :rank_achieved,
                        :percentage, :base_amount, :paid_date, :calculation_date,
                        :created_at, :updated_at, :calculation_metadata
                    )
                """),
                bonuses_to_create
            )
        
        OptimizedBonusEngine._bulk_update_balances(db, balance_updates)
        db.commit()
        
        logger.info(f"Created {len(bonuses_to_create)} infinity bonuses for {month}/{year}")
        return bonuses_to_create
    
    @staticmethod
    def get_user_bonus_summary(db: Session, user_id: int, days: int = 30) -> Dict:
        """Get user bonus summary with single optimized query"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        summary_query = text("""
            SELECT 
                bonus_type,
                currency,
                COUNT(*) as bonus_count,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount
            FROM bonuses 
            WHERE user_id = :user_id 
            AND created_at >= :cutoff_date
            AND status = 'paid'
            GROUP BY bonus_type, currency
            ORDER BY total_amount DESC
        """)
        
        result = db.execute(summary_query, {
            "user_id": user_id,
            "cutoff_date": cutoff_date
        }).fetchall()
        
        summary = {
            "total_bonuses": 0,
            "total_amount": 0,
            "by_type": {},
            "by_currency": {}
        }
        
        for row in result:
            bonus_type = row.bonus_type
            currency = row.currency
            count = row.bonus_count
            amount = float(row.total_amount)
            
            summary["total_bonuses"] += count
            summary["total_amount"] += amount
            
            if bonus_type not in summary["by_type"]:
                summary["by_type"][bonus_type] = {"count": 0, "amount": 0}
            summary["by_type"][bonus_type]["count"] += count
            summary["by_type"][bonus_type]["amount"] += amount
            
            if currency not in summary["by_currency"]:
                summary["by_currency"][currency] = {"count": 0, "amount": 0}
            summary["by_currency"][currency]["count"] += count
            summary["by_currency"][currency]["amount"] += amount
        
        return summary
