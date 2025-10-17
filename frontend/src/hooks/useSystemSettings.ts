import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SystemSettingsUpdate } from '@/types/system';

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SystemSettingsUpdate) => {
      await api.put('/admin/config/config/settings/platform', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('System settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update system settings');
    },
  });
};
