export interface DashboardStats {
  balance_ngn: number;
  balance_usdt: number;
  total_earnings: number;
  current_rank: string;
  team_size: number;
  first_line_count: number;
  pending_payouts: number;
  recent_earnings_30d: number;
  activated_at?: string;
  deactivated_at?: string;
}

export interface TeamStats {
  total_turnover: number;
  team_size: number;
  first_line_count: number;
  active_members: number;
  monthly_volume: number;
}
