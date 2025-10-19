#!/usr/bin/env python3
"""
Script to delete all users and create new super admin user
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
import secrets

def create_super_admin():
    db = SessionLocal()
    try:
        # Delete all related records first to avoid foreign key constraints
        from app.models.transaction import Transaction
        from app.models.bonus import Bonus
        from app.models.payout import Payout
        from app.models.team import TeamMember
        
        db.query(Transaction).delete()
        db.query(Bonus).delete()
        db.query(Payout).delete()
        db.query(TeamMember).delete()
        db.commit()
        print("✅ All related records deleted")
        
        # Delete all existing users
        db.query(User).delete()
        db.commit()
        print("✅ All existing users deleted")
        
        # Create new super admin user
        admin_user = User(
            email="admin@rest.com",
            hashed_password=get_password_hash("Rest123$"),
            full_name="Super Admin",
            role=UserRole.admin,
            is_verified=True,
            is_active=True,
            referral_code=secrets.token_urlsafe(8)
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Super admin user created successfully")
        print(f"   Email: admin@rest.com")
        print(f"   Password: Rest123$")
        print(f"   Role: {admin_user.role.value}")
        
    except Exception as e:
        print(f"❌ Failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()