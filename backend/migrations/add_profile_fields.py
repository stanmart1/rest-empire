"""
Migration script to add profile fields (gender, date_of_birth, occupation)
Run this script to update the database schema
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Add new profile fields
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR"))
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("   - Added gender column")
        print("   - Added date_of_birth column")
        print("   - Added occupation column")

if __name__ == "__main__":
    run_migration()
