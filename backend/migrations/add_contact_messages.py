"""
Migration: Add contact messages table
"""
from sqlalchemy import text
from app.core.database import engine

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()

if __name__ == "__main__":
    upgrade()
    print("Migration completed: add_contact_messages")
