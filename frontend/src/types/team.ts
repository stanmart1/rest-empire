export interface TeamMemberInfo {
  id: number;
  full_name?: string;
  email: string;
  current_rank: string;
  registration_date: string;
  is_verified: boolean;
  is_active: boolean;
  activity_status: string;
  personal_turnover: number;
  team_size: number;
  depth: number;
}

export interface TeamTreeNode {
  id: number;
  full_name?: string;
  email: string;
  current_rank: string;
  registration_date: string;
  is_active: boolean;
  personal_turnover: number;
  team_turnover: number;
  direct_children_count: number;
  total_descendants: number;
  children: TeamTreeNode[];
}

export interface TeamStats {
  total_team_size: number;
  first_line_count: number;
  active_members: number;
  inactive_members: number;
  total_team_turnover: number;
}

export interface LegStats {
  member_id: number;
  member_name?: string;
  team_size: number;
  turnover: number;
  percentage: number;
}

export interface TeamLegBreakdown {
  first_leg: LegStats;
  second_leg: LegStats;
  other_legs_combined: LegStats;
  all_legs: LegStats[];
}
