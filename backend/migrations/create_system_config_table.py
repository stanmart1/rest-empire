"""
Migration script to create system_config table
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS system_config (
                id SERIAL PRIMARY KEY,
                key VARCHAR UNIQUE NOT NULL,
                value VARCHAR NOT NULL,
                description VARCHAR,
                is_public BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Insert default config values
        conn.execute(text("""
            INSERT INTO system_config (key, value, description, is_public)
            VALUES 
                ('min_payout_ngn', '5000', 'Minimum payout amount in NGN', false),
                ('min_payout_usdt', '10', 'Minimum payout amount in USDT', false),
                ('payout_fee_ngn', '1.5', 'Payout fee percentage for NGN', false),
                ('payout_fee_usdt', '2.0', 'Payout fee percentage for USDT', false)
            ON CONFLICT (key) DO NOTHING
        """))
        
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("   - Created system_config table")
        print("   - Inserted default config values")

if __name__ == "__main__":
    run_migration()
