import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def fix_book_cover_urls():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    
    try:
        # Fix URLs that start with http:// or https:// (malformed)
        cur.execute("""
            UPDATE books 
            SET cover_image = REPLACE(cover_image, 'https//', 'https://')
            WHERE cover_image LIKE '%https//%'
        """)
        
        cur.execute("""
            UPDATE books 
            SET cover_image = REPLACE(cover_image, 'http//', 'http://')
            WHERE cover_image LIKE '%http//%'
        """)
        
        # Fix localhost URLs to production
        cur.execute("""
            UPDATE books 
            SET cover_image = REPLACE(cover_image, 'http://localhost:8000', 'https://api.restempire.com')
            WHERE cover_image LIKE 'http://localhost:8000%'
        """)
        
        conn.commit()
        print("Book cover URLs fixed successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    fix_book_cover_urls()
