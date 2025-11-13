import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def seed_team_members():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if team members already exist
        result = conn.execute(text("SELECT COUNT(*) FROM about_team_members"))
        count = result.scalar()
        
        if count > 0:
            print(f"✓ Team members already exist ({count} members)")
            return
        
        # Insert default team members
        conn.execute(text("""
            INSERT INTO about_team_members (name, position, description, display_order, is_active)
            VALUES 
            ('Team Member One', 'Position Title', 'Brief description about team member and their role in the organization.', 0, TRUE),
            ('Team Member Two', 'Position Title', 'Brief description about team member and their role in the organization.', 1, TRUE),
            ('Team Member Three', 'Position Title', 'Brief description about team member and their role in the organization.', 2, TRUE);
        """))
        conn.commit()
        print("✓ Default team members seeded successfully")

if __name__ == "__main__":
    seed_team_members()
