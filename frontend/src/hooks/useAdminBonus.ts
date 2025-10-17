import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { BonusSettings } from '@/types/admin-bonus';

export const useBonusSettings = () => {
  return useQuery({
    queryKey: ['bonusSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/config/bonus-settings');
      return response.data as BonusSettings;
    },
  });
};

export const useUpdateBonusSettings = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<BonusSettings>) => {
      await api.put('/admin/config/bonus-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonusSettings'] });
      toast.success('Bonus settings updated successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to update bonus settings');
    },
  });
};
