from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS blogs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(100) NOT NULL,
                image_url VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        conn.commit()
        print("Blogs table created successfully")

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS blogs;"))
        conn.commit()
        print("Blogs table dropped successfully")

if __name__ == "__main__":
    upgrade()
