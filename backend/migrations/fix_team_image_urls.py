import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_image_urls():
    """Fix team member image URLs to use production domain"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Get all team members with localhost URLs
        result = conn.execute(text("""
            SELECT id, image_url 
            FROM about_team_members 
            WHERE image_url LIKE '%localhost:8000%'
        """))
        
        members = result.fetchall()
        
        if not members:
            print("✓ No team member images need updating")
            return
        
        print(f"Found {len(members)} team member(s) with localhost URLs")
        
        # Update each URL
        for member_id, old_url in members:
            # Replace localhost:8000 with production domain
            new_url = old_url.replace('http://localhost:8000', 'https://api.restempire.com')
            
            conn.execute(text("""
                UPDATE about_team_members 
                SET image_url = :new_url 
                WHERE id = :id
            """), {"new_url": new_url, "id": member_id})
            
            print(f"  Updated member {member_id}: {old_url} -> {new_url}")
        
        conn.commit()
        print(f"✓ Successfully updated {len(members)} team member image URL(s)")

if __name__ == "__main__":
    fix_image_urls()
