import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Event, Attendee } from '@/types/admin-events';

export const useEvents = () => {
  return useQuery<Event[]>({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const response = await api.get('/events/');
      return response.data;
    },
  });
};

export const useEventAttendees = (eventId?: number) => {
  return useQuery<Attendee[]>({
    queryKey: ['eventAttendees', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await api.get(`/events/${eventId}/attendees`);
      return response.data;
    },
    enabled: !!eventId,
  });
};

export const useCreateEvent = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post('/events/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      toast.success('Event created successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });
};

export const useUpdateEvent = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: number; data: any }) => {
      await api.put(`/events/${eventId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      toast.success('Event updated successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      toast.success('Event deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });
};
