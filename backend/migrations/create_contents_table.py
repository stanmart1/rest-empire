from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS contents (
                id SERIAL PRIMARY KEY,
                page VARCHAR(50) UNIQUE NOT NULL,
                content TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_contents_page ON contents(page);"))
        conn.commit()
        print("Contents table created successfully")

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS contents;"))
        conn.commit()
        print("Contents table dropped successfully")

if __name__ == "__main__":
    upgrade()
