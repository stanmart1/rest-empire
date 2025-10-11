export interface DashboardStats {
  balance_eur: number;
  balance_dbsp: number;
  total_earnings: number;
  current_rank: string;
  team_size: number;
  first_line_count: number;
  pending_payouts: number;
  recent_earnings_30d: number;
}

export interface TeamStats {
  total_turnover: number;
  team_size: number;
  first_line_count: number;
  active_members: number;
  monthly_volume: number;
}
