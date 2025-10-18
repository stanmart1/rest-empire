from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def seed():
    blogs = [
        ("How to Build a Successful Network Marketing Business", "Learn the fundamental strategies that top distributors use to build their network marketing empires. This comprehensive guide covers everything from mindset to execution.", "John Smith", None),
        ("Understanding the 14-Tier Rank System", "A comprehensive guide to maximizing your earnings through our unique ranking system. Discover how each rank unlocks new opportunities and income streams.", "Sarah Johnson", None),
        ("Top 5 Mistakes New Distributors Make", "Avoid these common pitfalls that prevent new distributors from achieving success. Learn from the experiences of seasoned professionals.", "Michael Brown", None),
    ]
    
    with engine.connect() as conn:
        for title, content, author, image_url in blogs:
            conn.execute(text("""
                INSERT INTO blogs (title, content, author, image_url)
                VALUES (:title, :content, :author, :image_url)
            """), {"title": title, "content": content, "author": author, "image_url": image_url})
        conn.commit()
        print(f"Seeded {len(blogs)} blogs successfully")

if __name__ == "__main__":
    seed()
