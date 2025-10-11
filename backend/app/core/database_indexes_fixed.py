from sqlalchemy import text
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

def create_performance_indexes_fixed(db: Session):
    """Create database indexes for optimal query performance (transaction-safe)"""
    
    indexes = [
        # User table indexes
        ("idx_users_sponsor_active", "CREATE INDEX IF NOT EXISTS idx_users_sponsor_active ON users(sponsor_id) WHERE is_active = true"),
        ("idx_users_rank_active", "CREATE INDEX IF NOT EXISTS idx_users_rank_active ON users(current_rank, is_active)"),
        ("idx_users_activity_status", "CREATE INDEX IF NOT EXISTS idx_users_activity_status ON users(activity_status, last_activity_date)"),
        ("idx_users_referral_code", "CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL"),
        
        # Team members indexes
        ("idx_team_ancestor_depth", "CREATE INDEX IF NOT EXISTS idx_team_ancestor_depth ON team_members(ancestor_id, depth)"),
        ("idx_team_user_depth", "CREATE INDEX IF NOT EXISTS idx_team_user_depth ON team_members(user_id, depth)"),
        ("idx_team_turnover", "CREATE INDEX IF NOT EXISTS idx_team_turnover ON team_members(personal_turnover DESC, total_turnover DESC)"),
        ("idx_team_ancestor_user", "CREATE INDEX IF NOT EXISTS idx_team_ancestor_user ON team_members(ancestor_id, user_id)"),
        
        # Transactions indexes
        ("idx_transactions_user_type_status", "CREATE INDEX IF NOT EXISTS idx_transactions_user_type_status ON transactions(user_id, transaction_type, status)"),
        ("idx_transactions_created_type", "CREATE INDEX IF NOT EXISTS idx_transactions_created_type ON transactions(created_at DESC, transaction_type)"),
        ("idx_transactions_status_amount", "CREATE INDEX IF NOT EXISTS idx_transactions_status_amount ON transactions(status, amount DESC)"),
        ("idx_transactions_currency_status", "CREATE INDEX IF NOT EXISTS idx_transactions_currency_status ON transactions(currency, status)"),
        
        # Bonuses indexes
        ("idx_bonuses_user_type_status", "CREATE INDEX IF NOT EXISTS idx_bonuses_user_type_status ON bonuses(user_id, bonus_type, status)"),
        ("idx_bonuses_source_transaction", "CREATE INDEX IF NOT EXISTS idx_bonuses_source_transaction ON bonuses(source_transaction_id) WHERE source_transaction_id IS NOT NULL"),
        ("idx_bonuses_calculation_date", "CREATE INDEX IF NOT EXISTS idx_bonuses_calculation_date ON bonuses(calculation_date DESC, status)"),
        ("idx_bonuses_paid_date", "CREATE INDEX IF NOT EXISTS idx_bonuses_paid_date ON bonuses(paid_date DESC) WHERE paid_date IS NOT NULL"),
        ("idx_bonuses_level_type", "CREATE INDEX IF NOT EXISTS idx_bonuses_level_type ON bonuses(level, bonus_type) WHERE level IS NOT NULL"),
        
        # Payouts indexes
        ("idx_payouts_user_status", "CREATE INDEX IF NOT EXISTS idx_payouts_user_status ON payouts(user_id, status)"),
        ("idx_payouts_status_created", "CREATE INDEX IF NOT EXISTS idx_payouts_status_created ON payouts(status, created_at DESC)"),
        ("idx_payouts_currency_amount", "CREATE INDEX IF NOT EXISTS idx_payouts_currency_amount ON payouts(currency, amount DESC)"),
        
        # Support tickets indexes
        ("idx_support_user_status", "CREATE INDEX IF NOT EXISTS idx_support_user_status ON support_tickets(user_id, status)"),
        ("idx_support_status_priority", "CREATE INDEX IF NOT EXISTS idx_support_status_priority ON support_tickets(status, priority, created_at DESC)"),
        ("idx_support_category", "CREATE INDEX IF NOT EXISTS idx_support_category ON support_tickets(category, created_at DESC)"),
        
        # Activity logs indexes
        ("idx_activity_user_date", "CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_logs(user_id, created_at DESC)"),
        ("idx_activity_action_date", "CREATE INDEX IF NOT EXISTS idx_activity_action_date ON activity_logs(action, created_at DESC)"),
        
        # Notifications indexes
        ("idx_notifications_user_read", "CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC)"),
        ("idx_notifications_type_created", "CREATE INDEX IF NOT EXISTS idx_notifications_type_created ON notifications(notification_type, created_at DESC)"),
        
        # Composite indexes for complex queries
        ("idx_team_performance", "CREATE INDEX IF NOT EXISTS idx_team_performance ON team_members(ancestor_id, depth, personal_turnover DESC) WHERE depth > 0"),
        ("idx_user_earnings", "CREATE INDEX IF NOT EXISTS idx_user_earnings ON users(total_earnings DESC, current_rank, is_active)"),
        ("idx_bonus_earnings", "CREATE INDEX IF NOT EXISTS idx_bonus_earnings ON bonuses(user_id, status, amount DESC, created_at DESC)"),
        ("idx_transaction_volume", "CREATE INDEX IF NOT EXISTS idx_transaction_volume ON transactions(transaction_type, status, created_at, amount) WHERE transaction_type = 'purchase'"),
    ]
    
    created_count = 0
    failed_count = 0
    
    for index_name, sql in indexes:
        try:
            db.execute(text(sql))
            logger.info(f"Created index: {index_name}")
            created_count += 1
        except Exception as e:
            logger.warning(f"Failed to create index {index_name}: {str(e)}")
            failed_count += 1
    
    # Commit all indexes at once
    try:
        db.commit()
        logger.info(f"Index creation complete: {created_count} created, {failed_count} failed")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to commit indexes: {str(e)}")
    
    return {"created": created_count, "failed": failed_count}

def create_materialized_views_fixed(db: Session):
    """Create materialized views with proper indexes"""
    
    views = [
        # Team statistics materialized view
        ("mv_team_stats", """
            CREATE MATERIALIZED VIEW IF NOT EXISTS mv_team_stats AS
            SELECT 
                tm.ancestor_id as user_id,
                COUNT(CASE WHEN tm.depth = 1 THEN 1 END) as first_line_count,
                COUNT(CASE WHEN tm.depth > 0 THEN 1 END) as total_team_count,
                SUM(tm.personal_turnover) as total_team_turnover,
                MAX(tm.depth) as max_depth,
                COUNT(CASE WHEN u.is_active AND tm.depth > 0 THEN 1 END) as active_team_count
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.depth >= 0
            GROUP BY tm.ancestor_id
        """),
        
        # User earnings summary
        ("mv_user_earnings", """
            CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_earnings AS
            SELECT 
                u.id as user_id,
                u.total_earnings,
                COALESCE(SUM(CASE WHEN b.bonus_type = 'unilevel' THEN b.amount END), 0) as unilevel_earnings,
                COALESCE(SUM(CASE WHEN b.bonus_type = 'rank_bonus' THEN b.amount END), 0) as rank_bonus_earnings,
                COALESCE(SUM(CASE WHEN b.bonus_type = 'infinity' THEN b.amount END), 0) as infinity_earnings,
                COUNT(b.id) as total_bonuses,
                MAX(b.created_at) as last_bonus_date
            FROM users u
            LEFT JOIN bonuses b ON u.id = b.user_id AND b.status = 'paid'
            GROUP BY u.id, u.total_earnings
        """),
        
        # Monthly volume summary
        ("mv_monthly_volume", """
            CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_volume AS
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                currency,
                COUNT(*) as transaction_count,
                SUM(amount) as total_volume,
                AVG(amount) as avg_transaction,
                COUNT(DISTINCT user_id) as unique_users
            FROM transactions
            WHERE transaction_type = 'purchase' AND status = 'completed'
            GROUP BY DATE_TRUNC('month', created_at), currency
        """)
    ]
    
    created_count = 0
    failed_count = 0
    
    for view_name, sql in views:
        try:
            db.execute(text(sql))
            logger.info(f"Created materialized view: {view_name}")
            created_count += 1
        except Exception as e:
            logger.warning(f"Failed to create view {view_name}: {str(e)}")
            failed_count += 1
    
    # Create indexes on materialized views (non-concurrent)
    mv_indexes = [
        ("idx_mv_team_stats_user", "CREATE INDEX IF NOT EXISTS idx_mv_team_stats_user ON mv_team_stats(user_id)"),
        ("idx_mv_user_earnings_user", "CREATE INDEX IF NOT EXISTS idx_mv_user_earnings_user ON mv_user_earnings(user_id)"),
        ("idx_mv_monthly_volume_month", "CREATE INDEX IF NOT EXISTS idx_mv_monthly_volume_month ON mv_monthly_volume(month DESC)"),
    ]
    
    for index_name, index_sql in mv_indexes:
        try:
            db.execute(text(index_sql))
            logger.info(f"Created materialized view index: {index_name}")
        except Exception as e:
            logger.warning(f"Failed to create materialized view index {index_name}: {str(e)}")
    
    try:
        db.commit()
        logger.info(f"Materialized view creation complete: {created_count} created, {failed_count} failed")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to commit materialized views: {str(e)}")
    
    return {"created": created_count, "failed": failed_count}
