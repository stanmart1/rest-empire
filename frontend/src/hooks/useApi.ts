import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Dashboard hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: apiService.user.getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Team hooks
export const useTeamMembers = (depth?: number) => {
  return useQuery({
    queryKey: ['team-members', depth],
    queryFn: () => apiService.team.getTeamMembers(depth),
  });
};

export const useTeamStats = () => {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: apiService.team.getTeamStats,
    refetchInterval: 60000, // Refresh every minute
  });
};

// Bonuses hooks
export const useBonuses = (params?: { page?: number; limit?: number; type?: string }) => {
  return useQuery({
    queryKey: ['bonuses', params],
    queryFn: () => apiService.bonuses.getBonuses(params),
  });
};

export const useBonusSummary = (period: string = '30d') => {
  return useQuery({
    queryKey: ['bonus-summary', period],
    queryFn: () => apiService.bonuses.getBonusSummary(period),
  });
};

// Mutation hooks
export const useLogin = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiService.auth.login(email, password),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Login failed",
        variant: "destructive",
      });
    },
  });
};

export const useRegister = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      full_name: string;
      phone_number?: string;
      referral_code?: string;
    }) => apiService.auth.register(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Registration successful! Please check your email for verification.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Registration failed",
        variant: "destructive",
      });
    },
  });
};

// Generic API hook for loading states
export const useApiCall = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};
