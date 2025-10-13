"""
Migration script to add balance_eur and balance_dbsp fields
Run this script to update the database schema
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Add new balance fields
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_eur NUMERIC(10, 2) DEFAULT 0"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_dbsp NUMERIC(10, 2) DEFAULT 0"))
        conn.commit()
        
        # Check if legacy fields exist before copying
        result = conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name='users' AND column_name IN ('balance_ngn', 'balance_usdt')
        """))
        legacy_columns = [row[0] for row in result]
        
        if 'balance_ngn' in legacy_columns:
            conn.execute(text("UPDATE users SET balance_eur = COALESCE(balance_ngn, 0) WHERE balance_eur = 0"))
            conn.commit()
        
        if 'balance_usdt' in legacy_columns:
            conn.execute(text("UPDATE users SET balance_dbsp = COALESCE(balance_usdt, 0) WHERE balance_dbsp = 0"))
            conn.commit()
        
        # Add indexes
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_balance_eur ON users(balance_eur)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_balance_dbsp ON users(balance_dbsp)"))
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("   - Added balance_eur column")
        print("   - Added balance_dbsp column")
        if legacy_columns:
            print(f"   - Copied data from legacy columns: {', '.join(legacy_columns)}")
        print("   - Added indexes")

if __name__ == "__main__":
    run_migration()
