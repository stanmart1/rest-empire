"""
Migration script to create user_verifications table
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_verifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                full_name VARCHAR NOT NULL,
                gender VARCHAR,
                date_of_birth TIMESTAMP,
                place_of_birth VARCHAR,
                nationality VARCHAR,
                document_type VARCHAR NOT NULL,
                document_number VARCHAR NOT NULL,
                document_issue_date TIMESTAMP,
                document_expiry_date TIMESTAMP,
                document_file_path VARCHAR,
                address_country VARCHAR,
                address_city VARCHAR,
                address_street VARCHAR,
                address_zip VARCHAR,
                business_name VARCHAR,
                business_type VARCHAR,
                business_reg_number VARCHAR,
                status VARCHAR DEFAULT 'pending',
                rejection_reason VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("   - Created user_verifications table")

if __name__ == "__main__":
    run_migration()
