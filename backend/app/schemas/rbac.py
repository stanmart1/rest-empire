from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Permission Schemas
class PermissionBase(BaseModel):
    name: str
    resource: str
    action: str
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionResponse(PermissionBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Role Schemas
class RoleBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permission_ids: List[int] = []

class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None

class RoleResponse(RoleBase):
    id: int
    is_active: bool
    is_system: bool
    created_at: datetime
    permissions: List[PermissionResponse] = []

    class Config:
        from_attributes = True

# User Role Assignment
class UserRoleAssign(BaseModel):
    user_id: int
    role_ids: List[int]

class UserRoleResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# User Permission Assignment
class UserPermissionAssign(BaseModel):
    user_id: int
    permission_id: int
    granted: bool = True

class UserPermissionResponse(BaseModel):
    id: int
    user_id: int
    permission_id: int
    granted: bool
    created_at: datetime

    class Config:
        from_attributes = True
