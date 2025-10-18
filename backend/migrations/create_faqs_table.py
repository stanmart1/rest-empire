from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS faqs (
                id SERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                "order" INTEGER DEFAULT 0
            );
        """))
        conn.commit()
        print("FAQs table created successfully")

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS faqs;"))
        conn.commit()
        print("FAQs table dropped successfully")

if __name__ == "__main__":
    upgrade()
