"""
Add profile_picture column to users table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine

def run_migration():
    """Add profile_picture column to users table"""
    with engine.connect() as conn:
        # Add profile_picture column
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture VARCHAR;
        """))
        
        conn.commit()
        print("✓ Added profile_picture column to users table")

if __name__ == "__main__":
    try:
        run_migration()
        print("\n✓ Migration completed successfully!")
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        sys.exit(1)
