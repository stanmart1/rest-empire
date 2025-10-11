#!/usr/bin/env python3
"""
Database Optimization CLI Tool for Rest Empire
Usage: python optimize_db.py [command]

Commands:
  full        - Run complete database optimization
  indexes     - Create performance indexes only
  views       - Create/refresh materialized views
  maintenance - Run regular maintenance
  stats       - Show performance statistics
"""

import sys
import argparse
from app.core.db_optimization import DatabaseOptimizer
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    parser = argparse.ArgumentParser(description='Database Optimization Tool')
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
    
    with DatabaseOptimizer() as optimizer:
        if args.command == 'full':
            print("Running full database optimization...")
            results = optimizer.optimize_database()
            
        elif args.command == 'indexes':
            print("Creating performance indexes...")
            from app.core.database_indexes import create_performance_indexes
            results = create_performance_indexes(optimizer.db)
            
        elif args.command == 'views':
            print("Creating/refreshing materialized views...")
            results = optimizer.refresh_views()
            
        elif args.command == 'maintenance':
            print("Running database maintenance...")
            from app.core.db_optimization import run_maintenance
            results = run_maintenance()
            
        elif args.command == 'stats':
            print("Getting performance statistics...")
            results = optimizer.get_query_performance_stats()
        
        print(f"\nResults: {results}")

if __name__ == "__main__":
    main()
