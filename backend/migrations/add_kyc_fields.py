"""
Add KYC verification fields to users table
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def run_migration():
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Add kyc_verified column
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;
        """)
        
        # Add kyc_verified_at column
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP;
        """)
        
        conn.commit()
        print("✓ Successfully added KYC fields to users table")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
