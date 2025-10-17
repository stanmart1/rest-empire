import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ActivationPackage, ActivationPayment } from '@/types/admin-activation';

export const useActivationPackages = () => {
  return useQuery<ActivationPackage[]>({
    queryKey: ['activation-packages'],
    queryFn: async () => {
      const response = await api.get('/admin/activation-packages/');
      return response.data;
    },
  });
};

export const useActivationPayments = () => {
  return useQuery<ActivationPayment[]>({
    queryKey: ['activation-payments'],
    queryFn: async () => {
      const response = await api.get('/admin/activation-packages/payments');
      return response.data;
    },
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/activation-packages/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-packages'] });
      toast.success('Package created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create package');
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/admin/activation-packages/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-packages'] });
      toast.success('Package updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update package');
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/activation-packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete package');
    },
  });
};

export const useApprovePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/activation-packages/payments/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-payments'] });
      toast.success('Payment approved and account activated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to approve payment');
    },
  });
};

export const useRejectPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/activation-packages/payments/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-payments'] });
      toast.success('Payment rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reject payment');
    },
  });
};
