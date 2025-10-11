from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal
from app.core.database_indexes import (
    create_performance_indexes, 
    create_materialized_views, 
    refresh_materialized_views,
    analyze_table_statistics
)
import logging
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)

class DatabaseOptimizer:
    """Database optimization management class"""
    
    def __init__(self):
        self.db = SessionLocal()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db.close()
    
    def optimize_database(self) -> Dict[str, Any]:
        """Run complete database optimization"""
        start_time = time.time()
        results = {}
        
        try:
            logger.info("Starting database optimization...")
            
            # 1. Create performance indexes
            logger.info("Creating performance indexes...")
            results["indexes"] = create_performance_indexes(self.db)
            
            # 2. Create materialized views
            logger.info("Creating materialized views...")
            results["materialized_views"] = create_materialized_views(self.db)
            
            # 3. Update table statistics
            logger.info("Analyzing table statistics...")
            analyze_table_statistics(self.db)
            results["statistics_updated"] = True
            
            # 4. Vacuum and analyze
            logger.info("Running vacuum analyze...")
            self.vacuum_analyze()
            results["vacuum_completed"] = True
            
            execution_time = time.time() - start_time
            results["execution_time"] = execution_time
            results["status"] = "completed"
            
            logger.info(f"Database optimization completed in {execution_time:.2f} seconds")
            
        except Exception as e:
            logger.error(f"Database optimization failed: {str(e)}")
            results["status"] = "failed"
            results["error"] = str(e)
        
        return results
    
    def vacuum_analyze(self):
        """Run vacuum and analyze on all tables"""
        tables = [
            "users", "team_members", "transactions", "bonuses",
            "payouts", "support_tickets", "activity_logs", "notifications",
            "ranks", "legal_documents", "notification_preferences", "system_config"
        ]
        
        for table in tables:
            try:
                # Note: VACUUM cannot be run inside a transaction
                self.db.execute(text(f"VACUUM ANALYZE {table}"))
                self.db.commit()
                logger.info(f"Vacuumed and analyzed table: {table}")
            except Exception as e:
                logger.warning(f"Failed to vacuum table {table}: {str(e)}")
                self.db.rollback()
    
    def refresh_views(self) -> Dict[str, Any]:
        """Refresh materialized views"""
        try:
            refresh_materialized_views(self.db)
            return {"status": "completed", "message": "Materialized views refreshed"}
        except Exception as e:
            logger.error(f"Failed to refresh materialized views: {str(e)}")
            return {"status": "failed", "error": str(e)}
    
    def get_query_performance_stats(self) -> Dict[str, Any]:
        """Get query performance statistics"""
        try:
            # Get slow queries
            slow_queries = self.db.execute(text("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows
                FROM pg_stat_statements 
                WHERE mean_time > 100
                ORDER BY mean_time DESC 
                LIMIT 10
            """)).fetchall()
            
            # Get table sizes
            table_sizes = self.db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            """)).fetchall()
            
            # Get index usage
            index_usage = self.db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes
                WHERE idx_tup_read > 0
                ORDER BY idx_tup_read DESC
                LIMIT 20
            """)).fetchall()
            
            return {
                "slow_queries": [dict(row) for row in slow_queries],
                "table_sizes": [dict(row) for row in table_sizes],
                "index_usage": [dict(row) for row in index_usage]
            }
            
        except Exception as e:
            logger.error(f"Failed to get performance stats: {str(e)}")
            return {"error": str(e)}
    
    def optimize_specific_queries(self) -> Dict[str, Any]:
        """Apply specific query optimizations"""
        optimizations = []
        
        try:
            # Set work_mem for complex queries
            self.db.execute(text("SET work_mem = '256MB'"))
            optimizations.append("Increased work_mem for session")
            
            # Enable parallel queries
            self.db.execute(text("SET max_parallel_workers_per_gather = 4"))
            optimizations.append("Enabled parallel query execution")
            
            # Optimize random page cost for SSD
            self.db.execute(text("SET random_page_cost = 1.1"))
            optimizations.append("Optimized random_page_cost for SSD")
            
            return {
                "status": "completed",
                "optimizations": optimizations
            }
            
        except Exception as e:
            logger.error(f"Failed to apply query optimizations: {str(e)}")
            return {"status": "failed", "error": str(e)}

def run_optimization():
    """Standalone function to run database optimization"""
    with DatabaseOptimizer() as optimizer:
        return optimizer.optimize_database()

def run_maintenance():
    """Run regular database maintenance"""
    with DatabaseOptimizer() as optimizer:
        results = {}
        
        # Refresh materialized views
        results["refresh_views"] = optimizer.refresh_views()
        
        # Update statistics
        try:
            analyze_table_statistics(optimizer.db)
            results["analyze_tables"] = {"status": "completed"}
        except Exception as e:
            results["analyze_tables"] = {"status": "failed", "error": str(e)}
        
        return results

if __name__ == "__main__":
    # Run optimization when script is executed directly
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "maintenance":
        print("Running database maintenance...")
        results = run_maintenance()
    else:
        print("Running full database optimization...")
        results = run_optimization()
    
    print(f"Results: {results}")
