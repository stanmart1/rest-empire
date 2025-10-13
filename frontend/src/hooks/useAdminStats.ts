import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AdminStats } from '@/lib/admin-types';

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  });
};
