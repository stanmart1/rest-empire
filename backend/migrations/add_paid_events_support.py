import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def add_paid_events_support():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    
    try:
        # Add columns to events table
        cur.execute("""
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS price_ngn NUMERIC(10, 2),
            ADD COLUMN IF NOT EXISTS price_usdt NUMERIC(10, 2)
        """)
        
        # Add payment status enum
        cur.execute("""
            DO $$ BEGIN
                CREATE TYPE paymentstatus AS ENUM ('pending', 'paid', 'failed', 'refunded');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """)
        
        # Add columns to event_registrations table
        cur.execute("""
            ALTER TABLE event_registrations 
            ADD COLUMN IF NOT EXISTS payment_status paymentstatus DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
            ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2),
            ADD COLUMN IF NOT EXISTS currency VARCHAR(10),
            ADD COLUMN IF NOT EXISTS payment_proof VARCHAR(500),
            ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP
        """)
        
        conn.commit()
        print("✓ Paid events support added successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    add_paid_events_support()
