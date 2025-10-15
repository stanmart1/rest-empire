import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CryptoSignal, CryptoSignalCreate, CryptoSignalUpdate } from '@/types/crypto-signals';

export const useCryptoSignals = () => {
  return useQuery({
    queryKey: ['admin-crypto-signals'],
    queryFn: async () => {
      const response = await api.get<CryptoSignal[]>('/crypto/signals');
      return response.data;
    }
  });
};

export const usePublishedSignals = () => {
  return useQuery({
    queryKey: ['crypto-signals'],
    queryFn: async () => {
      const response = await api.get<CryptoSignal[]>('/crypto/signals/published');
      return response.data;
    }
  });
};

export const useCreateSignal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CryptoSignalCreate) => {
      const response = await api.post<CryptoSignal>('/crypto/signals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-signals'] });
      toast.success('Signal created successfully');
    },
    onError: () => {
      toast.error('Failed to create signal');
    }
  });
};

export const useUpdateSignal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CryptoSignalUpdate }) => {
      const response = await api.put<CryptoSignal>(`/crypto/signals/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-signals'] });
      toast.success('Signal updated successfully');
    },
    onError: () => {
      toast.error('Failed to update signal');
    }
  });
};

export const useDeleteSignal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/crypto/signals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-signals'] });
      toast.success('Signal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete signal');
    }
  });
};
