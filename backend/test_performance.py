#!/usr/bin/env python3
"""
Performance Test Script for Database Optimizations
Tests query performance before and after optimizations
"""

import time
from sqlalchemy import text
from app.core.database import SessionLocal
from app.services.optimized_team_service import OptimizedTeamService
from app.services.optimized_bonus_engine import OptimizedBonusEngine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def time_query(db, query_name, query_func):
    """Time a query execution"""
    start_time = time.time()
    try:
        result = query_func()
        execution_time = time.time() - start_time
        logger.info(f"{query_name}: {execution_time:.4f}s")
        return execution_time, result
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"{query_name} failed: {str(e)} ({execution_time:.4f}s)")
        return execution_time, None

def test_query_performance():
    """Test various query performance scenarios"""
    db = SessionLocal()
    
    try:
        logger.info("=== Database Performance Test ===")
        
        # Test 1: User lookup with indexes
        def test_user_lookup():
            return db.execute(text("""
                SELECT id, email, current_rank, is_active 
                FROM users 
                WHERE is_active = true 
                ORDER BY total_earnings DESC 
                LIMIT 10
            """)).fetchall()
        
        time_query(db, "User lookup with earnings index", test_user_lookup)
        
        # Test 2: Team hierarchy query
        def test_team_hierarchy():
            return db.execute(text("""
                SELECT tm.ancestor_id, tm.user_id, tm.depth, tm.personal_turnover
                FROM team_members tm
                WHERE tm.ancestor_id = 1 AND tm.depth <= 5
                ORDER BY tm.depth, tm.personal_turnover DESC
            """)).fetchall()
        
        time_query(db, "Team hierarchy query", test_team_hierarchy)
        
        # Test 3: Bonus calculations query
        def test_bonus_query():
            return db.execute(text("""
                SELECT b.user_id, b.bonus_type, SUM(b.amount) as total_bonus
                FROM bonuses b
                WHERE b.status = 'paid' 
                AND b.calculation_date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY b.user_id, b.bonus_type
                ORDER BY total_bonus DESC
                LIMIT 20
            """)).fetchall()
        
        time_query(db, "Bonus calculations query", test_bonus_query)
        
        # Test 4: Transaction volume query
        def test_transaction_volume():
            return db.execute(text("""
                SELECT 
                    DATE_TRUNC('day', created_at) as day,
                    COUNT(*) as transaction_count,
                    SUM(amount) as daily_volume
                FROM transactions
                WHERE transaction_type = 'purchase' 
                AND status = 'completed'
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY day DESC
            """)).fetchall()
        
        time_query(db, "Transaction volume query", test_transaction_volume)
        
        # Test 5: Materialized view query
        def test_materialized_view():
            return db.execute(text("""
                SELECT user_id, total_team_count, total_team_turnover
                FROM mv_team_stats
                WHERE total_team_count > 0
                ORDER BY total_team_turnover DESC
                LIMIT 10
            """)).fetchall()
        
        time_query(db, "Materialized view query", test_materialized_view)
        
        # Test 6: Complex join query
        def test_complex_join():
            return db.execute(text("""
                SELECT 
                    u.id,
                    u.email,
                    u.current_rank,
                    ts.total_team_count,
                    ts.total_team_turnover,
                    ue.unilevel_earnings,
                    ue.rank_bonus_earnings
                FROM users u
                LEFT JOIN mv_team_stats ts ON u.id = ts.user_id
                LEFT JOIN mv_user_earnings ue ON u.id = ue.user_id
                WHERE u.is_active = true
                ORDER BY ts.total_team_turnover DESC NULLS LAST
                LIMIT 15
            """)).fetchall()
        
        time_query(db, "Complex join with materialized views", test_complex_join)
        
        # Test 7: Optimized service methods
        if db.execute(text("SELECT COUNT(*) FROM users")).scalar() > 0:
            user_id = db.execute(text("SELECT id FROM users LIMIT 1")).scalar()
            
            def test_optimized_team_stats():
                return OptimizedTeamService.get_team_stats_bulk(db, user_id)
            
            time_query(db, "Optimized team stats service", test_optimized_team_stats)
            
            def test_optimized_leg_breakdown():
                return OptimizedTeamService.calculate_leg_breakdown_optimized(db, user_id)
            
            time_query(db, "Optimized leg breakdown service", test_optimized_leg_breakdown)
        
        logger.info("=== Performance Test Complete ===")
        
    finally:
        db.close()

def test_index_usage():
    """Test if indexes are being used"""
    db = SessionLocal()
    
    try:
        logger.info("=== Index Usage Analysis ===")
        
        # Check if indexes exist
        indexes = db.execute(text("""
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_%'
            ORDER BY tablename, indexname
        """)).fetchall()
        
        logger.info(f"Found {len(indexes)} custom indexes:")
        for idx in indexes[:10]:  # Show first 10
            logger.info(f"  {idx.tablename}.{idx.indexname}")
        
        # Check materialized views
        views = db.execute(text("""
            SELECT schemaname, matviewname 
            FROM pg_matviews 
            WHERE schemaname = 'public'
        """)).fetchall()
        
        logger.info(f"Found {len(views)} materialized views:")
        for view in views:
            logger.info(f"  {view.matviewname}")
        
        # Test query plan for a complex query
        plan = db.execute(text("""
            EXPLAIN (ANALYZE, BUFFERS) 
            SELECT u.id, u.email, u.current_rank, ts.total_team_count
            FROM users u
            LEFT JOIN mv_team_stats ts ON u.id = ts.user_id
            WHERE u.is_active = true
            ORDER BY u.total_earnings DESC
            LIMIT 5
        """)).fetchall()
        
        logger.info("Query execution plan:")
        for line in plan:
            logger.info(f"  {line[0]}")
        
    finally:
        db.close()

if __name__ == "__main__":
    print("Running database performance tests...")
    test_query_performance()
    print("\nRunning index usage analysis...")
    test_index_usage()
    print("\nPerformance testing complete!")
