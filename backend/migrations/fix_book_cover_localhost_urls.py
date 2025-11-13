from app.core.database import SessionLocal
from app.models.book import Book
from app.core.config import settings

def fix_book_cover_urls():
    db = SessionLocal()
    
    try:
        books = db.query(Book).all()
        fixed_count = 0
        
        for book in books:
            if book.cover_image:
                original_url = book.cover_image
                
                # Fix malformed URLs
                url = original_url.replace("http//", "http://").replace("https//", "https://")
                
                # Replace localhost URLs
                if "localhost" in url and "/uploads/" in url:
                    path = url.split("/uploads/")[1]
                    
                    if settings.ENVIRONMENT == "production":
                        api_base = settings.API_BASE_URL or "https://api.restempire.com"
                        url = f"{api_base}/uploads/{path}"
                    else:
                        url = f"/uploads/{path}"
                
                if url != original_url:
                    book.cover_image = url
                    fixed_count += 1
                    print(f"Fixed book ID {book.id}: {book.title}")
                    print(f"  Old: {original_url}")
                    print(f"  New: {url}")
        
        db.commit()
        print(f"\nFixed {fixed_count} book cover URLs")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_book_cover_urls()
