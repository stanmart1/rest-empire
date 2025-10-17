import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useSearchUsers = (search: string) => {
  return useQuery({
    queryKey: ['admin-users-search', search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      const response = await api.get('/admin/users', {
        params: { search, limit: 20 }
      });
      return response.data;
    },
    enabled: search.length >= 2,
  });
};
