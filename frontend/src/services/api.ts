import api from '@/lib/api';
import { User, Transaction, Bonus, TeamMember, Payout, DashboardStats, RankProgress } from '@/lib/types';

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    referral_code?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  getReferralInfo: async () => {
    const response = await api.get('/users/referral');
    return response.data;
  }
};

// Team API
export const teamAPI = {
  getTeamMembers: async (depth?: number): Promise<TeamMember[]> => {
    const params = depth ? { depth } : {};
    const response = await api.get('/team/members', { params });
    return response.data;
  },

  getTeamStats: async () => {
    const response = await api.get('/team/stats');
    return response.data;
  },

  getLegBreakdown: async () => {
    const response = await api.get('/team/legs');
    return response.data;
  }
};

// Bonuses API
export const bonusAPI = {
  getBonuses: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) => {
    const response = await api.get('/bonuses', { params });
    return response.data;
  },

  getBonusSummary: async (period: string = '30d') => {
    const response = await api.get('/bonuses/summary', { params: { period } });
    return response.data;
  }
};

// Transactions API
export const transactionAPI = {
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  }
};

// Payouts API
export const payoutAPI = {
  getPayouts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/payouts', { params });
    return response.data;
  },

  requestPayout: async (data: {
    amount: number;
    currency: string;
    method: string;
    account_details: string;
  }) => {
    const response = await api.post('/payouts', data);
    return response.data;
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  team: teamAPI,
  bonuses: bonusAPI,
  transactions: transactionAPI,
  payouts: payoutAPI
};
