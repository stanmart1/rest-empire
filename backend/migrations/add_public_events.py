"""
Migration: Add public events support
"""
from sqlalchemy import text
from app.core.database import engine

def upgrade():
    with engine.connect() as conn:
        # Add is_public and public_link to events
        conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS public_link VARCHAR(100) UNIQUE"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_events_public_link ON events(public_link)"))
        
        # Make user_id nullable and add guest fields to event_registrations
        conn.execute(text("ALTER TABLE event_registrations ALTER COLUMN user_id DROP NOT NULL"))
        conn.execute(text("ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255)"))
        conn.execute(text("ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255)"))
        conn.execute(text("ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50)"))
        
        conn.commit()

if __name__ == "__main__":
    upgrade()
    print("Migration completed: add_public_events")
