import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { PromoMaterial } from '@/types/admin-promo';

export const usePromoMaterials = () => {
  return useQuery<PromoMaterial[]>({
    queryKey: ['adminPromoMaterials'],
    queryFn: async () => {
      const response = await api.get('/promo-materials/');
      return response.data;
    },
  });
};

export const useCreatePromoMaterial = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      await api.post('/admin/promo-materials', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromoMaterials'] });
      toast.success('Material created successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to create material');
    },
  });
};

export const useUpdatePromoMaterial = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ materialId, data }: { materialId: number; data: any }) => {
      await api.put(`/admin/promo-materials/${materialId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromoMaterials'] });
      toast.success('Material updated successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to update material');
    },
  });
};

export const useDeletePromoMaterial = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/promo-materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromoMaterials'] });
      toast.success('Material deleted successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to delete material');
    },
  });
};
