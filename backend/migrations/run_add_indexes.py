#!/usr/bin/env python3
"""
Run this script to add performance indexes to the database
Usage: python migrations/run_add_indexes.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import engine

def run_migration():
    """Execute the index creation migration"""
    sql_file = Path(__file__).parent / "add_performance_indexes.sql"
    
    with open(sql_file, 'r') as f:
        sql = f.read()
    
    with engine.connect() as conn:
        # Split by semicolon and execute each statement
        statements = [s.strip() for s in sql.split(';') if s.strip()]
        
        for statement in statements:
            if statement:
                print(f"Executing: {statement[:60]}...")
                conn.execute(text(statement))
                conn.commit()
        
        print("\n✅ All indexes created successfully!")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
