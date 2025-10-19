from typing import List, Set
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.permission import Permission
from app.models.role import Role
from app.models.user_role import UserRole
from app.models.user_permission import UserPermission
from app.models.role_permission import RolePermission

def get_user_permissions(db: Session, user: User) -> Set[str]:
    """Get all permissions for a user (from roles + direct assignments)"""
    permissions = set()
    
    # Get permissions from roles
    role_perms = db.query(Permission.name).join(
        RolePermission, RolePermission.permission_id == Permission.id
    ).join(
        UserRole, UserRole.role_id == RolePermission.role_id
    ).filter(
        UserRole.user_id == user.id,
        Permission.is_active == True
    ).all()
    
    permissions.update([p[0] for p in role_perms])
    
    # Get direct user permissions (can grant or revoke)
    user_perms = db.query(Permission.name, UserPermission.granted).join(
        UserPermission, UserPermission.permission_id == Permission.id
    ).filter(
        UserPermission.user_id == user.id,
        Permission.is_active == True
    ).all()
    
    # Apply direct permissions (granted=True adds, granted=False removes)
    for perm_name, granted in user_perms:
        if granted:
            permissions.add(perm_name)
        else:
            permissions.discard(perm_name)
    
    return permissions

def has_permission(db: Session, user: User, permission: str) -> bool:
    """Check if user has a specific permission"""
    user_permissions = get_user_permissions(db, user)
    return permission in user_permissions

def has_any_permission(db: Session, user: User, permissions: List[str]) -> bool:
    """Check if user has any of the specified permissions"""
    user_permissions = get_user_permissions(db, user)
    return any(p in user_permissions for p in permissions)

def has_all_permissions(db: Session, user: User, permissions: List[str]) -> bool:
    """Check if user has all of the specified permissions"""
    user_permissions = get_user_permissions(db, user)
    return all(p in user_permissions for p in permissions)

def get_user_roles(db: Session, user: User) -> List[Role]:
    """Get all roles assigned to a user"""
    return db.query(Role).join(
        UserRole, UserRole.role_id == Role.id
    ).filter(
        UserRole.user_id == user.id,
        Role.is_active == True
    ).all()

def has_role(db: Session, user: User, role_name: str) -> bool:
    """Check if user has a specific role"""
    return db.query(UserRole).join(
        Role, Role.id == UserRole.role_id
    ).filter(
        UserRole.user_id == user.id,
        Role.name == role_name,
        Role.is_active == True
    ).first() is not None
