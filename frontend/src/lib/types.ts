export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  current_rank: string;
  rankLevel: number;
  isAdmin: boolean;
  is_verified: boolean;
  is_active: boolean;
  referral_code: string;
  sponsor_id?: string;
  registration_date: string;
  balance_ngn: number;
  balance_usdt: number;
  total_earnings: number;
  gender?: string;
  date_of_birth?: string;
  occupation?: string;
}

export interface DashboardStats {
  balance_ngn: number;
  balance_usdt: number;
  total_earnings: number;
  current_rank: string;
  team_size: number;
  first_line_count: number;
  pending_payouts: number;
  recent_earnings_30d: number;
  is_active: boolean;
  rank_progress?: {
    current_rank: string;
    next_rank?: string;
    current_turnover: number;
    next_requirement?: number;
    percentage: number;
  };
}

export interface Balance {
  ngn: number;
  usdt: number;
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
  transaction_type: 'purchase' | 'bonus' | 'payout' | 'refund' | 'fee';
  amount: number;
  currency: 'NGN' | 'USDT';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  description: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Bonus {
  id: string;
  type: 'unilevel' | 'rank' | 'infinity';
  amount: number;
  currency: 'EUR' | 'DBSP';
  source_user_id: string;
  source_user_name: string;
  level?: number;
  status: 'pending' | 'paid';
  created_at: string;
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
  currency: 'NGN' | 'USDT';
  payout_method: 'bank_transfer' | 'crypto';
  account_details: any;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  processing_fee: number;
  net_amount: number;
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
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
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  user_id: string;
  user_name: string;
  is_admin: boolean;
  message: string;
  attachments?: string[];
  created_at: string;
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
