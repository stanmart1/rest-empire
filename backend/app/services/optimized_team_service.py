from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, and_, select, text
from app.models.user import User
from app.models.team import TeamMember
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class LegData:
    member_id: int
    member_name: str
    team_size: int
    turnover: float
    percentage: float = 0.0

class OptimizedTeamService:
    
    @staticmethod
    def get_team_with_stats(db: Session, user_id: int, depth: int = None) -> List[Dict]:
        """Get team members with preloaded stats in single query"""
        query = db.query(
            TeamMember.user_id,
            TeamMember.depth,
            TeamMember.personal_turnover,
            TeamMember.total_turnover,
            User.full_name,
            User.email,
            User.current_rank,
            User.is_active,
            User.registration_date
        ).join(User, TeamMember.user_id == User.id).filter(
            TeamMember.ancestor_id == user_id,
            TeamMember.depth > 0
        )
        
        if depth:
            query = query.filter(TeamMember.depth <= depth)
        
        return [
            {
                "user_id": row.user_id,
                "depth": row.depth,
                "personal_turnover": float(row.personal_turnover or 0),
                "total_turnover": float(row.total_turnover or 0),
                "name": row.full_name or row.email,
                "rank": row.current_rank,
                "is_active": row.is_active,
                "registration_date": row.registration_date
            }
            for row in query.all()
        ]
    
    @staticmethod
    def get_team_stats_bulk(db: Session, user_id: int) -> Dict:
        """Get all team statistics in optimized bulk query"""
        # Single query for team counts and turnovers
        stats_query = db.query(
            func.count(TeamMember.user_id).label('total_team'),
            func.sum(TeamMember.personal_turnover).label('total_turnover'),
            func.count(
                func.case([(TeamMember.depth == 1, 1)])
            ).label('first_line_count')
        ).filter(
            TeamMember.ancestor_id == user_id,
            TeamMember.depth > 0
        ).first()
        
        return {
            "total_team": stats_query.total_team or 0,
            "total_turnover": float(stats_query.total_turnover or 0),
            "first_line_count": stats_query.first_line_count or 0
        }
    
    @staticmethod
    def calculate_leg_breakdown_optimized(db: Session, user_id: int) -> Dict:
        """Optimized leg breakdown calculation with minimal queries"""
        # Get first line with their leg turnovers in single query
        leg_query = text("""
            WITH leg_turnovers AS (
                SELECT 
                    fl.id as member_id,
                    fl.full_name,
                    fl.email,
                    COALESCE(SUM(tm.personal_turnover), 0) as leg_turnover,
                    COUNT(tm.user_id) as team_size
                FROM users fl
                LEFT JOIN team_members tm ON (
                    tm.ancestor_id = fl.id OR tm.user_id = fl.id
                )
                WHERE fl.sponsor_id = :user_id
                GROUP BY fl.id, fl.full_name, fl.email
            )
            SELECT 
                member_id,
                COALESCE(full_name, email) as member_name,
                team_size,
                leg_turnover,
                (leg_turnover / NULLIF(SUM(leg_turnover) OVER(), 0) * 100) as percentage
            FROM leg_turnovers
            ORDER BY leg_turnover DESC
        """)
        
        result = db.execute(leg_query, {"user_id": user_id}).fetchall()
        
        if not result:
            return {
                "first_leg": None,
                "second_leg": None,
                "other_legs": {"turnover": 0, "percentage": 0, "count": 0},
                "all_legs": []
            }
        
        legs = [
            LegData(
                member_id=row.member_id,
                member_name=row.member_name,
                team_size=row.team_size,
                turnover=float(row.leg_turnover),
                percentage=float(row.percentage or 0)
            )
            for row in result
        ]
        
        first_leg = legs[0] if legs else None
        second_leg = legs[1] if len(legs) > 1 else None
        other_legs_data = legs[2:] if len(legs) > 2 else []
        
        return {
            "first_leg": first_leg.__dict__ if first_leg else None,
            "second_leg": second_leg.__dict__ if second_leg else None,
            "other_legs": {
                "turnover": sum(leg.turnover for leg in other_legs_data),
                "percentage": sum(leg.percentage for leg in other_legs_data),
                "count": len(other_legs_data)
            },
            "all_legs": [leg.__dict__ for leg in legs]
        }
    
    @staticmethod
    def bulk_update_turnover(db: Session, user_transactions: List[tuple]) -> None:
        """Bulk update turnover for multiple users efficiently"""
        if not user_transactions:
            return
        
        # Batch update personal turnovers
        personal_updates = []
        for user_id, amount in user_transactions:
            personal_updates.append({
                "user_id": user_id,
                "amount": amount
            })
        
        # Update personal turnovers in batch
        if personal_updates:
            db.execute(
                text("""
                    UPDATE team_members 
                    SET personal_turnover = personal_turnover + :amount
                    WHERE user_id = :user_id AND depth = 0
                """),
                personal_updates
            )
        
        # Update ancestor turnovers efficiently
        for user_id, amount in user_transactions:
            db.execute(
                text("""
                    UPDATE team_members 
                    SET total_turnover = total_turnover + :amount
                    WHERE ancestor_id IN (
                        SELECT ancestor_id 
                        FROM team_members 
                        WHERE user_id = :user_id AND depth > 0
                    ) AND depth = 0
                """),
                {"user_id": user_id, "amount": amount}
            )
        
        db.commit()
    
    @staticmethod
    def get_active_ancestors_batch(db: Session, user_ids: List[int], max_depth: int = 15) -> Dict[int, List[int]]:
        """Get active ancestors for multiple users in single query"""
        # Get all ancestor relationships
        ancestor_query = db.query(
            TeamMember.user_id,
            TeamMember.ancestor_id,
            TeamMember.depth,
            User.is_active,
            User.activity_status
        ).join(
            User, TeamMember.ancestor_id == User.id
        ).filter(
            TeamMember.user_id.in_(user_ids),
            TeamMember.depth > 0,
            TeamMember.depth <= max_depth,
            User.is_active == True,
            User.activity_status == 'active'
        ).order_by(
            TeamMember.user_id,
            TeamMember.depth
        ).all()
        
        # Group by user_id
        result = {}
        for row in ancestor_query:
            if row.user_id not in result:
                result[row.user_id] = []
            result[row.user_id].append(row.ancestor_id)
        
        return result
    
    @staticmethod
    def get_team_performance_summary(db: Session, user_id: int) -> Dict:
        """Get comprehensive team performance in single optimized query"""
        summary_query = text("""
            WITH team_stats AS (
                SELECT 
                    tm.depth,
                    COUNT(*) as member_count,
                    SUM(tm.personal_turnover) as level_turnover,
                    COUNT(CASE WHEN u.is_active THEN 1 END) as active_count
                FROM team_members tm
                JOIN users u ON tm.user_id = u.id
                WHERE tm.ancestor_id = :user_id AND tm.depth > 0
                GROUP BY tm.depth
            ),
            total_stats AS (
                SELECT 
                    COUNT(*) as total_members,
                    SUM(tm.personal_turnover) as total_turnover,
                    COUNT(CASE WHEN u.is_active THEN 1 END) as total_active
                FROM team_members tm
                JOIN users u ON tm.user_id = u.id
                WHERE tm.ancestor_id = :user_id AND tm.depth > 0
            )
            SELECT 
                ts.depth,
                ts.member_count,
                ts.level_turnover,
                ts.active_count,
                tot.total_members,
                tot.total_turnover,
                tot.total_active
            FROM team_stats ts
            CROSS JOIN total_stats tot
            ORDER BY ts.depth
        """)
        
        result = db.execute(summary_query, {"user_id": user_id}).fetchall()
        
        if not result:
            return {
                "levels": [],
                "totals": {"members": 0, "turnover": 0, "active": 0}
            }
        
        levels = []
        totals = None
        
        for row in result:
            levels.append({
                "depth": row.depth,
                "member_count": row.member_count,
                "turnover": float(row.level_turnover or 0),
                "active_count": row.active_count
            })
            
            if not totals:
                totals = {
                    "members": row.total_members,
                    "turnover": float(row.total_turnover or 0),
                    "active": row.total_active
                }
        
        return {
            "levels": levels,
            "totals": totals or {"members": 0, "turnover": 0, "active": 0}
        }
