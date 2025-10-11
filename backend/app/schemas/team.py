from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TeamMemberInfo(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    current_rank: str
    registration_date: datetime
    is_verified: bool
    is_active: bool
    activity_status: str
    personal_turnover: float
    team_size: int
    depth: int
    
    class Config:
        from_attributes = True

class TeamTreeNode(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    current_rank: str
    registration_date: datetime
    is_active: bool
    personal_turnover: float
    team_turnover: float
    direct_children_count: int
    total_descendants: int
    children: List['TeamTreeNode'] = []
    
    class Config:
        from_attributes = True

class TeamStats(BaseModel):
    total_team_size: int
    first_line_count: int
    active_members: int
    inactive_members: int
    total_team_turnover: float
    
class LegStats(BaseModel):
    member_id: int
    member_name: Optional[str]
    team_size: int
    turnover: float
    percentage: float

class TeamLegBreakdown(BaseModel):
    first_leg: LegStats
    second_leg: LegStats
    other_legs_combined: LegStats
    all_legs: List[LegStats]
