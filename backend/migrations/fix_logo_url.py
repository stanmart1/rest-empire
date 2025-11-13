import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_logo_url():
    """Fix logo URL in system_config to use production domain"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Get logo config with localhost URL
        result = conn.execute(text("""
            SELECT id, value 
            FROM system_config 
            WHERE key = 'site_logo' AND value LIKE '%localhost:8000%'
        """))
        
        config = result.fetchone()
        
        if not config:
            print("✓ Logo URL does not need updating")
            return
        
        config_id, old_url = config
        print(f"Found logo with localhost URL")
        
        # Replace localhost:8000 with production domain
        new_url = old_url.replace('http://localhost:8000', 'https://api.restempire.com')
        
        conn.execute(text("""
            UPDATE system_config 
            SET value = :new_url 
            WHERE id = :id
        """), {"new_url": new_url, "id": config_id})
        
        conn.commit()
        print(f"  Updated: {old_url} -> {new_url}")
        print(f"✓ Successfully updated logo URL")

if __name__ == "__main__":
    fix_logo_url()
