export interface AdminPayout {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  payout_method: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  bank_details?: any;
  crypto_address?: string;
}
