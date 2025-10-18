from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS about (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        conn.commit()
        print("About table created successfully")

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS about;"))
        conn.commit()
        print("About table dropped successfully")

if __name__ == "__main__":
    upgrade()
