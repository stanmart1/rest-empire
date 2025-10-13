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
export const useTeamTree = (params?: { depth?: number; skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['team-tree', params],
    queryFn: () => apiService.team.getTeamTree(params),
  });
};

export const useFirstLine = () => {
  return useQuery({
    queryKey: ['first-line'],
    queryFn: apiService.team.getFirstLine,
  });
};

export const useTeamStats = () => {
  return useQuery({
    queryKey: ['team-stats'],
    queryFn: apiService.team.getTeamStats,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useLegBreakdown = () => {
  return useQuery({
    queryKey: ['leg-breakdown'],
    queryFn: apiService.team.getLegBreakdown,
  });
};

export const useSearchMembers = (params?: {
  search?: string;
  rank?: string;
  status?: string;
  skip?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['search-members', params],
    queryFn: () => apiService.team.searchMembers(params),
    enabled: !!(params?.search || params?.rank || params?.status),
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
        description: "Registration successful!",
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

// Ranks hooks
export const useRanks = () => {
  return useQuery({
    queryKey: ['ranks'],
    queryFn: apiService.ranks.getRanks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRankProgress = () => {
  return useQuery({
    queryKey: ['rank-progress'],
    queryFn: apiService.ranks.getRankProgress,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useRankHistory = () => {
  return useQuery({
    queryKey: ['rank-history'],
    queryFn: apiService.ranks.getRankHistory,
  });
};

// Events hooks
export const useEvents = (params?: {
  event_type?: string;
  status?: string;
  upcoming_only?: boolean;
}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => apiService.events.getEvents(params),
  });
};

export const useMyEvents = (upcoming_only?: boolean) => {
  return useQuery({
    queryKey: ['my-events', upcoming_only],
    queryFn: () => apiService.events.getMyEvents(upcoming_only),
  });
};

export const useEventStats = () => {
  return useQuery({
    queryKey: ['event-stats'],
    queryFn: apiService.events.getEventStats,
  });
};

export const useEvent = (id: number) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => apiService.events.getEvent(id),
    enabled: !!id,
  });
};

// Promo Materials hooks
export const usePromoMaterials = (params?: {
  material_type?: string;
  language?: string;
}) => {
  return useQuery({
    queryKey: ['promo-materials', params],
    queryFn: () => apiService.promoMaterials.getMaterials(params),
  });
};



// Transactions hooks
export const useTransactions = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => apiService.transactions.getTransactions(params),
  });
};

// Payouts hooks
export const usePayouts = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['payouts', params],
    queryFn: () => apiService.payouts.getPayouts(params),
  });
};

// Activation hooks
export const useActivationPackages = () => {
  return useQuery({
    queryKey: ['activation-packages'],
    queryFn: apiService.activation.getPackages,
  });
};

export const useActivationStatus = () => {
  return useQuery({
    queryKey: ['activation-status'],
    queryFn: apiService.activation.getStatus,
  });
};

// Books hooks
export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: apiService.books.getBooks,
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
