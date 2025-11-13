"""Fix malformed book cover URLs in database"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Fix http// to http://
        conn.execute(text("""
            UPDATE books 
            SET cover_image = REPLACE(cover_image, 'http//', 'http://')
            WHERE cover_image LIKE '%http//%'
        """))
        
        # Fix https// to https://
        conn.execute(text("""
            UPDATE books 
            SET cover_image = REPLACE(cover_image, 'https//', 'https://')
            WHERE cover_image LIKE '%https//%'
        """))
        
        conn.commit()
        print("✓ Fixed malformed book cover URLs")

if __name__ == "__main__":
    run_migration()
