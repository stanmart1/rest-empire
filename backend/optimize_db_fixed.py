#!/usr/bin/env python3
"""
Database Optimization CLI Tool for Rest Empire (Fixed Version)
Usage: python optimize_db_fixed.py [command]

Commands:
  full        - Run complete database optimization
  indexes     - Create performance indexes only
  views       - Create/refresh materialized views
  maintenance - Run regular maintenance
  stats       - Show performance statistics
"""

import sys
import argparse
from app.core.database import SessionLocal
from app.core.database_indexes_fixed import create_performance_indexes_fixed, create_materialized_views_fixed
from app.core.database_indexes import analyze_table_statistics, refresh_materialized_views
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def run_full_optimization():
    """Run complete database optimization with fixed methods"""
    start_time = time.time()
    results = {}
    
    db = SessionLocal()
    try:
        logger.info("Starting database optimization...")
        
        # 1. Create performance indexes
        logger.info("Creating performance indexes...")
        results["indexes"] = create_performance_indexes_fixed(db)
        
        # 2. Create materialized views
        logger.info("Creating materialized views...")
        results["materialized_views"] = create_materialized_views_fixed(db)
        
        # 3. Update table statistics
        logger.info("Analyzing table statistics...")
        analyze_table_statistics(db)
        results["statistics_updated"] = True
        
        execution_time = time.time() - start_time
        results["execution_time"] = execution_time
        results["status"] = "completed"
        
        logger.info(f"Database optimization completed in {execution_time:.2f} seconds")
        
    except Exception as e:
        logger.error(f"Database optimization failed: {str(e)}")
        results["status"] = "failed"
        results["error"] = str(e)
        db.rollback()
    finally:
        db.close()
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Database Optimization Tool (Fixed)')
    parser.add_argument(
        'command',
        choices=['full', 'indexes', 'views', 'maintenance', 'stats'],
        help='Optimization command to run'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    db = SessionLocal()
    try:
        if args.command == 'full':
            print("Running full database optimization...")
            results = run_full_optimization()
            
        elif args.command == 'indexes':
            print("Creating performance indexes...")
            results = create_performance_indexes_fixed(db)
            
        elif args.command == 'views':
            print("Creating/refreshing materialized views...")
            results = create_materialized_views_fixed(db)
            
        elif args.command == 'maintenance':
            print("Running database maintenance...")
            try:
                refresh_materialized_views(db)
                analyze_table_statistics(db)
                results = {"status": "completed", "message": "Maintenance completed"}
            except Exception as e:
                results = {"status": "failed", "error": str(e)}
            
        elif args.command == 'stats':
            print("Getting performance statistics...")
            # Simple stats query
            try:
                from sqlalchemy import text
                table_sizes = db.execute(text("""
                    SELECT 
                        schemaname,
                        tablename,
                        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
                    LIMIT 10
                """)).fetchall()
                
                results = {
                    "table_sizes": [{"schema": row.schemaname, "table": row.tablename, "size": row.size} for row in table_sizes]
                }
            except Exception as e:
                results = {"error": str(e)}
        
        print(f"\nResults: {results}")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
