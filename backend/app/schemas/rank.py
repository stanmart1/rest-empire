from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RankResponse(BaseModel):
    id: int
    name: str
    level: int
    team_turnover_required: float
    first_leg_requirement: float
    second_leg_requirement: float
    other_legs_requirement: float
    bonus_amount: float
    infinity_bonus_percentage: Optional[float]
    display_name: Optional[str]
    icon_url: Optional[str]
    color_hex: Optional[str]
    description: Optional[str]
    
    class Config:
        from_attributes = True

class RankProgress(BaseModel):
    current_rank: RankResponse
    next_rank: Optional[RankResponse]
    total_turnover: float
    total_turnover_progress: float
    first_leg_turnover: float
    first_leg_progress: float
    second_leg_turnover: float
    second_leg_progress: float
    other_legs_turnover: float
    other_legs_progress: float
    overall_progress: float
    requirements_met: dict

class RankHistory(BaseModel):
    rank_name: str
    achieved_date: datetime
    bonus_earned: float
