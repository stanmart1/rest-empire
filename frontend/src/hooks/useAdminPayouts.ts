import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AdminPayout } from '@/types/admin-payouts';

export const usePayouts = () => {
  return useQuery<AdminPayout[]>({
    queryKey: ['adminPayouts'],
    queryFn: async () => {
      const response = await api.get('/admin/payouts');
      return response.data;
    },
  });
};

export const useApprovePayout = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payoutId: number) => {
      await api.post(`/admin/payouts/${payoutId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
      toast.success('Payout approved successfully');
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to approve payout');
    },
  });
};

export const useRejectPayout = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payoutId: number) => {
      await api.post(`/admin/payouts/${payoutId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
      toast.success('Payout rejected');
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reject payout');
    },
  });
};
