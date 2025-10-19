#!/usr/bin/env python3
"""
Migration script to add token configuration settings to system_config table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.services.config_service import set_config

def migrate():
    db = SessionLocal()
    try:
        # Initialize token configuration with default values
        set_config(db, "access_token_expire_minutes", "30", "JWT access token expiration time in minutes")
        set_config(db, "refresh_token_expire_days", "7", "JWT refresh token expiration time in days")
        
        print("✅ Token configuration settings added successfully")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()