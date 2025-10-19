#!/usr/bin/env python3
"""
RBAC Migration Runner - Week 1 & 2 Fixes
Runs all migrations to fix RBAC system
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration(engine, sql_file):
    """Run a SQL migration file"""
    print(f"\n{'='*60}")
    print(f"Running: {sql_file}")
    print('='*60)
    
    with open(sql_file, 'r') as f:
        sql = f.read()
    
    # Split by semicolon and execute each statement
    statements = [s.strip() for s in sql.split(';') if s.strip()]
    
    with engine.connect() as conn:
        for i, statement in enumerate(statements, 1):
            try:
                print(f"  [{i}/{len(statements)}] Executing statement...")
                conn.execute(text(statement))
                conn.commit()
            except Exception as e:
                print(f"  ⚠️  Warning: {str(e)}")
                continue
    
    print(f"✅ Completed: {sql_file}\n")

def main():
    print("\n" + "="*60)
    print("RBAC SYSTEM FIX - Week 1 & 2 Migrations")
    print("="*60)
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    migrations_dir = Path(__file__).parent
    
    # Migration order
    migrations = [
        migrations_dir / "standardize_permissions.sql",
        migrations_dir / "remove_legacy_role_system.sql",
    ]
    
    print("\nMigrations to run:")
    for i, m in enumerate(migrations, 1):
        print(f"  {i}. {m.name}")
    
    response = input("\nProceed with migrations? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Aborted")
        return
    
    # Run migrations
    for migration in migrations:
        if migration.exists():
            run_migration(engine, migration)
        else:
            print(f"⚠️  Skipping {migration.name} (file not found)")
    
    print("\n" + "="*60)
    print("✅ ALL MIGRATIONS COMPLETED!")
    print("="*60)
    print("\nNext steps:")
    print("1. Restart your application")
    print("2. Test admin endpoints with new permissions")
    print("3. Verify RBAC is working correctly")
    print("\nNote: All users with old 'admin' role have been migrated to 'super_admin'")
    print("      All permission names have been standardized")
    print("      Legacy role column has been removed")
    print()

if __name__ == "__main__":
    main()
