import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Role, Permission, RoleCreate } from '@/types/rbac';

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/admin/rbac/roles');
      return response.data;
    },
  });
};

export const usePermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/admin/rbac/permissions');
      return response.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RoleCreate) => {
      await api.post('/admin/rbac/roles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: () => {
      toast.error('Failed to create role');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleId: number) => {
      await api.delete(`/admin/rbac/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete role');
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: number; permissions: number[] }) => {
      await api.put(`/admin/rbac/roles/${roleId}`, { permission_ids: permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permissions updated successfully');
    },
    onError: () => {
      toast.error('Failed to update permissions');
    },
  });
};

export const useUserRoles = (userId: number | undefined, enabled: boolean = true) => {
  return useQuery<Role[]>({
    queryKey: ['userRoles', userId],
    queryFn: async () => {
      const response = await api.get(`/admin/rbac/users/${userId}/roles`);
      return response.data;
    },
    enabled: !!userId && enabled,
  });
};

export const useAssignUserRoles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: number; roleIds: number[] }) => {
      await api.post(`/admin/rbac/users/${userId}/roles`, { role_ids: roleIds });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Roles updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update roles');
    },
  });
};
