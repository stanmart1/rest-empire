import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SupportTicket } from '@/types/admin-support';

export const useSupportTickets = () => {
  return useQuery<SupportTicket[]>({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      const response = await api.get('/admin/tickets');
      return response.data;
    },
  });
};

export const useRespondToTicket = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      await api.post(`/admin/tickets/${ticketId}/respond`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      toast.success('Response sent successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to send response');
    },
  });
};

export const useUpdateTicketStatus = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number; status: string }) => {
      await api.put(`/admin/tickets/${ticketId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
      toast.success('Status updated successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });
};
