export interface AdminStats {
  total_users: number;
  active_users: number;
  pending_verifications: number;
  total_revenue_ngn: number;
  total_revenue_usdt: number;
  pending_payouts: number;
  total_bonuses_paid: number;
  total_books: number;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  current_rank: string;
  balance_ngn: number;
  balance_usdt: number;
  registration_date: string;
  sponsor_id?: number;
}

export interface AdminVerification {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  full_name: string;
  document_type: string;
  document_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason?: string;
}

export interface AdminPayout {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  amount: number;
  currency: 'NGN' | 'USDT';
  payout_method: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
}
