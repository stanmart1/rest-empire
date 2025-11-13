import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_book_cover_urls():
    """Fix book cover and file URLs to use production domain"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Get all books with localhost URLs in cover_image or file_path
        result = conn.execute(text("""
            SELECT id, title, cover_image, file_path 
            FROM books 
            WHERE cover_image LIKE '%localhost:8000%' OR file_path LIKE '%localhost:8000%'
        """))
        
        books = result.fetchall()
        
        if not books:
            print("✓ No book covers or files need updating")
            return
        
        print(f"Found {len(books)} book(s) with localhost URLs")
        
        # Update each book
        for book_id, title, cover_image, file_path in books:
            new_cover = cover_image.replace('http://localhost:8000', 'https://api.restempire.com') if cover_image else cover_image
            new_file = file_path.replace('http://localhost:8000', 'https://api.restempire.com') if file_path else file_path
            
            conn.execute(text("""
                UPDATE books 
                SET cover_image = :cover, file_path = :file 
                WHERE id = :id
            """), {"cover": new_cover, "file": new_file, "id": book_id})
            
            print(f"  Updated book: {title}")
            if cover_image and 'localhost' in cover_image:
                print(f"    Cover: {cover_image} -> {new_cover}")
            if file_path and 'localhost' in file_path:
                print(f"    File: {file_path} -> {new_file}")
        
        conn.commit()
        print(f"✓ Successfully updated {len(books)} book(s)")

if __name__ == "__main__":
    fix_book_cover_urls()
