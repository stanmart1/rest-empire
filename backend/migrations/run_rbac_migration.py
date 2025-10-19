import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    """Run RBAC migration"""
    engine = create_engine(settings.DATABASE_URL)
    
    # Read and execute table creation
    with open(os.path.join(os.path.dirname(__file__), 'create_rbac_tables.sql'), 'r') as f:
        sql = f.read()
    
    with engine.connect() as conn:
        conn.execute(text(sql))
        conn.commit()
        print("✓ RBAC tables created")
    
    # Read and execute seed data
    with open(os.path.join(os.path.dirname(__file__), 'seed_rbac_data.sql'), 'r') as f:
        sql = f.read()
    
    with engine.connect() as conn:
        conn.execute(text(sql))
        conn.commit()
        print("✓ RBAC seed data inserted")
    
    print("\n✓ RBAC migration completed successfully!")

if __name__ == "__main__":
    run_migration()
