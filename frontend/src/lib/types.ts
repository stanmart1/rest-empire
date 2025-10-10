export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  rank: string;
  rankLevel: number;
  isAdmin: boolean;
  isVerified: boolean;
  referralCode: string;
  sponsorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  eur: number;
  dbsp: number;
  usdt: number;
}

export interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  teamSize: number;
  pendingPayouts: number;
  balance: Balance;
}

export interface RankProgress {
  currentRank: string;
  nextRank: string;
  totalTurnover: number;
  requiredTurnover: number;
  leg1: { turnover: number; percentage: number };
  leg2: { turnover: number; percentage: number };
  leg3: { turnover: number; percentage: number };
  requiredLeg1: number;
  requiredLeg2: number;
  requiredLeg3: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'bonus' | 'payout' | 'refund';
  amount: number;
  currency: 'EUR' | 'USDT' | 'DBSP';
  status: 'pending' | 'completed' | 'failed' | 'processing' | 'cancelled';
  paymentMethod?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bonus {
  id: string;
  type: 'unilevel' | 'rank' | 'infinity';
  amount: number;
  currency: 'EUR' | 'DBSP';
  sourceUserId: string;
  sourceUserName: string;
  level?: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  rank: string;
  rankLevel: number;
  personalTurnover: number;
  teamSize: number;
  isActive: boolean;
  registrationDate: string;
  children?: TeamMember[];
}

export interface Payout {
  id: string;
  amount: number;
  currency: 'EUR' | 'USDT' | 'DBSP';
  method: 'bank' | 'crypto';
  accountDetails: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  fee: number;
  netAmount: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rank {
  name: string;
  level: number;
  color: string;
  icon: string;
  requiredTurnover: number;
  requiredLeg1: number;
  requiredLeg2: number;
  requiredLeg3: number;
  bonus: number;
}

export const RANK_LEVELS: Rank[] = [
  { name: 'Pearl', level: 1, color: 'gray', icon: 'gem', requiredTurnover: 10000, requiredLeg1: 5000, requiredLeg2: 3000, requiredLeg3: 0, bonus: 0 },
  { name: 'Sapphire', level: 2, color: 'blue', icon: 'gem', requiredTurnover: 25000, requiredLeg1: 12500, requiredLeg2: 7500, requiredLeg3: 0, bonus: 0 },
  { name: 'Ruby', level: 3, color: 'red', icon: 'gem', requiredTurnover: 50000, requiredLeg1: 25000, requiredLeg2: 15000, requiredLeg3: 0, bonus: 0 },
  { name: 'Emerald', level: 4, color: 'emerald', icon: 'gem', requiredTurnover: 100000, requiredLeg1: 50000, requiredLeg2: 30000, requiredLeg3: 0, bonus: 0 },
  { name: 'Diamond', level: 5, color: 'cyan', icon: 'crown', requiredTurnover: 250000, requiredLeg1: 125000, requiredLeg2: 75000, requiredLeg3: 0, bonus: 0 },
  { name: 'Blue Diamond', level: 6, color: 'blue', icon: 'crown', requiredTurnover: 500000, requiredLeg1: 250000, requiredLeg2: 150000, requiredLeg3: 0, bonus: 0 },
  { name: 'Green Diamond', level: 7, color: 'green', icon: 'crown', requiredTurnover: 1000000, requiredLeg1: 500000, requiredLeg2: 300000, requiredLeg3: 0, bonus: 0 },
  { name: 'Purple Diamond', level: 8, color: 'purple', icon: 'crown', requiredTurnover: 2000000, requiredLeg1: 1000000, requiredLeg2: 600000, requiredLeg3: 0, bonus: 0 },
  { name: 'Red Diamond', level: 9, color: 'red', icon: 'crown', requiredTurnover: 6000000, requiredLeg1: 3000000, requiredLeg2: 1800000, requiredLeg3: 0, bonus: 0 },
  { name: 'Black Diamond', level: 10, color: 'gray', icon: 'crown', requiredTurnover: 12000000, requiredLeg1: 6000000, requiredLeg2: 3600000, requiredLeg3: 0, bonus: 0 },
  { name: 'Ultima Diamond', level: 11, color: 'yellow', icon: 'crown', requiredTurnover: 60000000, requiredLeg1: 30000000, requiredLeg2: 18000000, requiredLeg3: 0, bonus: 0 },
  { name: 'Double Ultima Diamond', level: 12, color: 'orange', icon: 'crown', requiredTurnover: 120000000, requiredLeg1: 60000000, requiredLeg2: 36000000, requiredLeg3: 0, bonus: 0 },
  { name: 'Triple Ultima Diamond', level: 13, color: 'purple', icon: 'crown', requiredTurnover: 500000000, requiredLeg1: 250000000, requiredLeg2: 150000000, requiredLeg3: 0, bonus: 0 },
  { name: 'Billion Diamond', level: 14, color: 'indigo', icon: 'crown', requiredTurnover: 1000000000, requiredLeg1: 500000000, requiredLeg2: 300000000, requiredLeg3: 0, bonus: 0 },
];

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
