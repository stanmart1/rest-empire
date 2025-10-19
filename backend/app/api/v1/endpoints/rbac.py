from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import require_permission, get_current_user
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole
from app.schemas.rbac import (
    RoleResponse, RoleCreate, RoleUpdate, PermissionResponse,
    UserRoleAssign, UserRoleResponse
)

router = APIRouter()

# ============ PERMISSIONS ============

@router.get("/permissions", response_model=List[PermissionResponse])
def get_all_permissions(
    current_user: User = Depends(require_permission("roles:list")),
    db: Session = Depends(get_db)
):
    """Get all permissions"""
    return db.query(Permission).filter(Permission.is_active == True).all()

# ============ ROLES ============

@router.get("/roles", response_model=List[RoleResponse])
def get_all_roles(
    current_user: User = Depends(require_permission("roles:list")),
    db: Session = Depends(get_db)
):
    """Get all roles with their permissions"""
    roles = db.query(Role).filter(Role.is_active == True).all()
    
    result = []
    for role in roles:
        role_perms = db.query(Permission).join(
            RolePermission, RolePermission.permission_id == Permission.id
        ).filter(RolePermission.role_id == role.id).all()
        
        role_dict = {
            "id": role.id,
            "name": role.name,
            "display_name": role.display_name,
            "description": role.description,
            "is_active": role.is_active,
            "is_system": role.is_system,
            "created_at": role.created_at,
            "permissions": role_perms
        }
        result.append(role_dict)
    
    return result

@router.get("/roles/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    current_user: User = Depends(require_permission("roles:view")),
    db: Session = Depends(get_db)
):
    """Get role details"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    role_perms = db.query(Permission).join(
        RolePermission, RolePermission.permission_id == Permission.id
    ).filter(RolePermission.role_id == role.id).all()
    
    return {
        "id": role.id,
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "is_active": role.is_active,
        "is_system": role.is_system,
        "created_at": role.created_at,
        "permissions": role_perms
    }

@router.post("/roles", response_model=RoleResponse)
def create_role(
    role_data: RoleCreate,
    current_user: User = Depends(require_permission("roles:create")),
    db: Session = Depends(get_db)
):
    """Create a new role"""
    # Check if role name already exists
    existing = db.query(Role).filter(Role.name == role_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    # Create role
    role = Role(
        name=role_data.name,
        display_name=role_data.display_name,
        description=role_data.description,
        is_system=False
    )
    db.add(role)
    db.flush()
    
    # Assign permissions
    for perm_id in role_data.permission_ids:
        perm = db.query(Permission).filter(Permission.id == perm_id).first()
        if perm:
            db.add(RolePermission(role_id=role.id, permission_id=perm_id))
    
    db.commit()
    db.refresh(role)
    
    # Get permissions
    role_perms = db.query(Permission).join(
        RolePermission, RolePermission.permission_id == Permission.id
    ).filter(RolePermission.role_id == role.id).all()
    
    return {
        "id": role.id,
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "is_active": role.is_active,
        "is_system": role.is_system,
        "created_at": role.created_at,
        "permissions": role_perms
    }

@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    role_data: RoleUpdate,
    current_user: User = Depends(require_permission("roles:update")),
    db: Session = Depends(get_db)
):
    """Update role"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Can't modify super_admin
    if role.name == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot modify super_admin role")
    
    # Update fields
    if role_data.display_name:
        role.display_name = role_data.display_name
    if role_data.description is not None:
        role.description = role_data.description
    if role_data.is_active is not None:
        role.is_active = role_data.is_active
    
    # Update permissions if provided
    if role_data.permission_ids is not None:
        # Remove existing permissions
        db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
        
        # Add new permissions
        for perm_id in role_data.permission_ids:
            perm = db.query(Permission).filter(Permission.id == perm_id).first()
            if perm:
                db.add(RolePermission(role_id=role.id, permission_id=perm_id))
    
    db.commit()
    db.refresh(role)
    
    # Get permissions
    role_perms = db.query(Permission).join(
        RolePermission, RolePermission.permission_id == Permission.id
    ).filter(RolePermission.role_id == role.id).all()
    
    return {
        "id": role.id,
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "is_active": role.is_active,
        "is_system": role.is_system,
        "created_at": role.created_at,
        "permissions": role_perms
    }

@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    current_user: User = Depends(require_permission("roles:delete")),
    db: Session = Depends(get_db)
):
    """Delete role (except super_admin)"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Can't delete super_admin
    if role.name == "super_admin":
        raise HTTPException(status_code=403, detail="Cannot delete super_admin role")
    
    # Check if role is assigned to any users
    user_count = db.query(UserRole).filter(UserRole.role_id == role_id).count()
    if user_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete role. It is assigned to {user_count} user(s)"
        )
    
    db.delete(role)
    db.commit()
    
    return {"message": "Role deleted successfully"}

# ============ USER ROLE ASSIGNMENT ============

@router.get("/users/{user_id}/roles", response_model=List[RoleResponse])
def get_user_roles(
    user_id: int,
    current_user: User = Depends(require_permission("users:view")),
    db: Session = Depends(get_db)
):
    """Get roles assigned to a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    roles = db.query(Role).join(
        UserRole, UserRole.role_id == Role.id
    ).filter(UserRole.user_id == user_id).all()
    
    result = []
    for role in roles:
        role_perms = db.query(Permission).join(
            RolePermission, RolePermission.permission_id == Permission.id
        ).filter(RolePermission.role_id == role.id).all()
        
        result.append({
            "id": role.id,
            "name": role.name,
            "display_name": role.display_name,
            "description": role.description,
            "is_active": role.is_active,
            "is_system": role.is_system,
            "created_at": role.created_at,
            "permissions": role_perms
        })
    
    return result

@router.post("/users/{user_id}/roles")
def assign_roles_to_user(
    user_id: int,
    role_data: UserRoleAssign,
    current_user: User = Depends(require_permission("users:assign_roles")),
    db: Session = Depends(get_db)
):
    """Assign roles to a user (replaces existing roles)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove existing roles
    db.query(UserRole).filter(UserRole.user_id == user_id).delete()
    
    # Assign new roles
    for role_id in role_data.role_ids:
        role = db.query(Role).filter(Role.id == role_id, Role.is_active == True).first()
        if not role:
            raise HTTPException(status_code=404, detail=f"Role {role_id} not found")
        
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            assigned_by=current_user.id
        )
        db.add(user_role)
    
    db.commit()
    
    return {"message": f"Assigned {len(role_data.role_ids)} role(s) to user"}

@router.delete("/users/{user_id}/roles/{role_id}")
def remove_role_from_user(
    user_id: int,
    role_id: int,
    current_user: User = Depends(require_permission("users:assign_roles")),
    db: Session = Depends(get_db)
):
    """Remove a specific role from a user"""
    user_role = db.query(UserRole).filter(
        UserRole.user_id == user_id,
        UserRole.role_id == role_id
    ).first()
    
    if not user_role:
        raise HTTPException(status_code=404, detail="User role assignment not found")
    
    db.delete(user_role)
    db.commit()
    
    return {"message": "Role removed from user"}
