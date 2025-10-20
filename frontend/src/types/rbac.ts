export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
}

export interface RoleCreate {
  name: string;
  display_name: string;
  description: string;
  permission_ids: number[];
}
