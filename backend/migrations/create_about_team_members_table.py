import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS about_team_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                image_url VARCHAR(500),
                display_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE
            );
        """))
        conn.commit()
        print("✓ about_team_members table created successfully")

if __name__ == "__main__":
    run_migration()
