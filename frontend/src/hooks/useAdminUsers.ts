import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AdminUser } from '@/lib/admin-types';

export const useSearchUsers = (search: string) => {
  return useQuery({
    queryKey: ['admin-users-search', search],
    queryFn: async () => {
      if (!search || search.length < 3) return [];
      const response = await api.get('/admin/users', {
        params: { search, limit: 20 }
      });
      return response.data;
    },
    enabled: search.length >= 2,
  });
};

export const useAdminUsers = () => {
  return useQuery<AdminUser[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await api.post(`/admin/users/${userId}/verify-kyc`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User KYC verified successfully');
    },
    onError: () => {
      toast.error('Failed to verify user KYC');
    },
  });
};
