export interface UnilevelSettings {
  enabled: boolean;
  percentages: number[];
}

export interface RankBonusSettings {
  enabled: boolean;
  amounts: Record<string, number>;
}

export interface InfinityBonusSettings {
  enabled: boolean;
  percentage: number;
}

export interface BonusSettings {
  unilevel: UnilevelSettings;
  rank_bonus: RankBonusSettings;
  infinity_bonus: InfinityBonusSettings;
}
