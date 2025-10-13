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
    const response = await api.get('/users/me');
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
  getTeamTree: async (params?: { depth?: number; skip?: number; limit?: number }) => {
    const response = await api.get('/team/tree', { params });
    return response.data;
  },

  getFirstLine: async () => {
    const response = await api.get('/team/first-line');
    return response.data;
  },

  getTeamStats: async () => {
    const response = await api.get('/team/stats');
    return response.data;
  },

  getLegBreakdown: async () => {
    const response = await api.get('/team/legs');
    return response.data;
  },

  searchMembers: async (params?: {
    search?: string;
    rank?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/team/search', { params });
    return response.data;
  },

  getMemberChildren: async (memberId: number) => {
    const response = await api.get(`/team/member/${memberId}/children`);
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
    const response = await api.get('/bonuses/', { params });
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
    const response = await api.get('/transactions/', { params });
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
    const response = await api.get('/payouts/', { params });
    return response.data;
  },

  requestPayout: async (data: {
    amount: number;
    currency: string;
    method: string;
    account_details: string;
  }) => {
    const response = await api.post('/payouts/request', data);
    return response.data;
  }
};

// Ranks API
export const ranksAPI = {
  getRanks: async () => {
    const response = await api.get('/ranks');
    return response.data;
  },

  getRankProgress: async () => {
    const response = await api.get('/ranks/progress');
    return response.data;
  },

  getRankHistory: async () => {
    const response = await api.get('/ranks/history');
    return response.data;
  },

  recalculateRank: async () => {
    const response = await api.post('/ranks/recalculate');
    return response.data;
  }
};

// Events API
export const eventsAPI = {
  getEvents: async (params?: {
    event_type?: string;
    status?: string;
    upcoming_only?: boolean;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/events/', { params });
    return response.data;
  },

  getMyEvents: async (upcoming_only?: boolean) => {
    const response = await api.get('/events/my-events', { 
      params: { upcoming_only } 
    });
    return response.data;
  },

  getEventStats: async () => {
    const response = await api.get('/events/stats');
    return response.data;
  },

  getEvent: async (id: number) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  registerForEvent: async (id: number) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  unregisterFromEvent: async (id: number) => {
    const response = await api.delete(`/events/${id}/register`);
    return response.data;
  }
};

// Promo Materials API
export const promoMaterialsAPI = {
  getMaterials: async (params?: {
    material_type?: string;
    language?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/promo-materials/', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/promo-materials/stats');
    return response.data;
  },

  downloadMaterial: async (id: number) => {
    const response = await api.post(`/promo-materials/${id}/download`);
    return response.data;
  }
};

// Books API
export const booksAPI = {
  getBooks: async () => {
    const response = await api.get('/books/');
    return response.data;
  },

  createReview: async (bookId: number, reviewData: { rating: number; comment?: string }) => {
    const response = await api.post(`/books/${bookId}/reviews`, reviewData);
    return response.data;
  },

  getBookReviews: async (bookId: number) => {
    const response = await api.get(`/books/${bookId}/reviews`);
    return response.data;
  }
};

// Activation API
export const activationAPI = {
  getPackages: async () => {
    const response = await api.get('/activation/packages');
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/activation/status');
    return response.data;
  },

  requestActivation: async (data: { package: string; payment_method: string }) => {
    const response = await api.post('/activation/request', data);
    return response.data;
  }
};

// Support API
export const supportAPI = {
  createTicket: async (data: { subject: string; message: string; category?: string }) => {
    const response = await api.post('/support/tickets', data);
    return response.data;
  },

  getTickets: async () => {
    const response = await api.get('/support/tickets');
    return response.data;
  },

  getTicket: async (id: number) => {
    const response = await api.get(`/support/tickets/${id}`);
    return response.data;
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  team: teamAPI,
  bonuses: bonusAPI,
  transactions: transactionAPI,
  payouts: payoutAPI,
  ranks: ranksAPI,
  events: eventsAPI,
  promoMaterials: promoMaterialsAPI,
  books: booksAPI,
  activation: activationAPI,
  support: supportAPI
};
