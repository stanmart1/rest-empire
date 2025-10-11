export interface RankResponse {
  id: number;
  name: string;
  level: number;
  team_turnover_required: number;
  first_leg_requirement: number;
  second_leg_requirement: number;
  other_legs_requirement: number;
  bonus_amount: number;
  infinity_bonus_percentage?: number;
  display_name?: string;
  icon_url?: string;
  color_hex?: string;
  description?: string;
}

export interface RankProgress {
  current_rank: RankResponse;
  next_rank?: RankResponse;
  total_turnover: number;
  total_turnover_progress: number;
  first_leg_turnover: number;
  first_leg_progress: number;
  second_leg_turnover: number;
  second_leg_progress: number;
  other_legs_turnover: number;
  other_legs_progress: number;
  overall_progress: number;
  requirements_met: Record<string, boolean>;
}

export interface RankHistory {
  rank_name: string;
  achieved_date: string;
  bonus_earned: number;
}
