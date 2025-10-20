"""
Generic SQL migration runner
Usage: python run_migration.py <sql_file_path>
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration(sql_file):
    engine = create_engine(settings.DATABASE_URL)
    
    with open(sql_file, 'r') as f:
        sql = f.read()
    
    with engine.connect() as conn:
        conn.execute(text(sql))
        conn.commit()
        
        print(f"✅ Migration completed successfully: {sql_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_migration.py <sql_file_path>")
        sys.exit(1)
    
    run_migration(sys.argv[1])
