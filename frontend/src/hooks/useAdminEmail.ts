import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { EmailSettings } from '@/types/admin-email';

export const useEmailSettings = () => {
  return useQuery({
    queryKey: ['emailSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/config/email-settings');
      return response.data as EmailSettings;
    },
  });
};

export const useUpdateEmailSettings = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EmailSettings) => {
      await api.put('/admin/config/email-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      toast.success('Email settings updated successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to update email settings');
    },
  });
};

export const useSendTestEmail = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/admin/config/test-email', { email });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Test email sent successfully');
      } else {
        toast.error(data.message || 'Failed to send test email');
      }
    },
    onError: () => {
      toast.error('Failed to send test email');
    },
  });
};
