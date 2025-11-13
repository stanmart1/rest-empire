import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_book_urls():
    """Fix book cover URLs to use production domain"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Get all books with localhost URLs in cover_image
        result = conn.execute(text("""
            SELECT id, title, cover_image 
            FROM books 
            WHERE cover_image LIKE '%localhost:8000%'
        """))
        
        books = result.fetchall()
        
        if not books:
            print("✓ No book covers need updating")
            return
        
        print(f"Found {len(books)} book(s) with localhost URLs")
        
        # Update each book
        for book_id, title, cover_image in books:
            new_cover = cover_image.replace('http://localhost:8000', 'https://api.restempire.com')
            
            conn.execute(text("""
                UPDATE books 
                SET cover_image = :cover 
                WHERE id = :id
            """), {"cover": new_cover, "id": book_id})
            
            print(f"  Updated: {title}")
            print(f"    {cover_image} -> {new_cover}")
        
        conn.commit()
        print(f"✓ Successfully updated {len(books)} book(s)")

if __name__ == "__main__":
    fix_book_urls()
