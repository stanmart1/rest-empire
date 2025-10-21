import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Book, BookReview } from '@/types/admin-books';

export const useBooks = () => {
  return useQuery<Book[]>({
    queryKey: ['adminBooks'],
    queryFn: async () => {
      const response = await api.get('/admin/books');
      return response.data;
    },
  });
};

export const useBookReviews = (bookId?: number) => {
  return useQuery<BookReview[]>({
    queryKey: ['bookReviews', bookId],
    queryFn: async () => {
      if (!bookId) return [];
      const response = await api.get(`/admin/books/${bookId}/reviews`);
      return response.data;
    },
    enabled: !!bookId,
  });
};

export const useUploadBook = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, bookId }: { data: FormData; bookId?: number }) => {
      if (bookId) {
        await api.put(`/admin/books/${bookId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/admin/books', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      toast.success(variables.bookId ? 'Book updated successfully' : 'Book uploaded successfully');
      callbacks?.onSuccess?.();
    },
    onError: (_, variables) => {
      toast.error(variables.bookId ? 'Failed to update book' : 'Failed to upload book');
    },
  });
};

export const useDeleteBook = (callbacks?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId: number) => {
      await api.delete(`/admin/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBooks'] });
      toast.success('Book deleted successfully');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to delete book');
    },
  });
};
