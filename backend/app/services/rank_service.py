from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.rank import Rank
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.services.team_service import calculate_leg_breakdown, get_team_size
from app.utils.activity import log_activity
import asyncio

def get_rank_by_name(db: Session, rank_name: str) -> Rank:
    """Get rank by name"""
    return db.query(Rank).filter(Rank.name == rank_name).first()

def get_rank_by_level(db: Session, level: int) -> Rank:
    """Get rank by level"""
    return db.query(Rank).filter(Rank.level == level).first()

def get_all_ranks(db: Session):
    """Get all ranks ordered by level"""
    return db.query(Rank).order_by(Rank.level).all()

def check_rank_qualification(db: Session, user_id: int, rank: Rank) -> dict:
    """Check if user qualifies for a specific rank"""
    # Get leg breakdown
    breakdown = calculate_leg_breakdown(db, user_id)
    
    if not breakdown["first_leg"]:
        return {
            "qualified": False,
            "total_turnover": 0,
            "first_leg": 0,
            "second_leg": 0,
            "other_legs": 0
        }
    
    # Calculate totals
    total_turnover = sum(leg["turnover"] for leg in breakdown["all_legs"])
    first_leg_turnover = breakdown["first_leg"]["turnover"]
    second_leg_turnover = breakdown["second_leg"]["turnover"] if breakdown["second_leg"] else 0
    other_legs_turnover = breakdown["other_legs"]["turnover"]
    
    # Check requirements
    total_met = total_turnover >= float(rank.team_turnover_required)
    first_leg_met = first_leg_turnover >= float(rank.first_leg_requirement)
    second_leg_met = second_leg_turnover >= float(rank.second_leg_requirement)
    other_legs_met = other_legs_turnover >= float(rank.other_legs_requirement)
    
    qualified = total_met and first_leg_met and second_leg_met and other_legs_met
    
    return {
        "qualified": qualified,
        "total_turnover": total_turnover,
        "first_leg": first_leg_turnover,
        "second_leg": second_leg_turnover,
        "other_legs": other_legs_turnover,
        "requirements": {
            "total_met": total_met,
            "first_leg_met": first_leg_met,
            "second_leg_met": second_leg_met,
            "other_legs_met": other_legs_met
        }
    }

def calculate_user_rank(db: Session, user_id: int) -> bool:
    """Calculate and update user's rank. Returns True if rank changed."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    current_rank = get_rank_by_name(db, user.current_rank)
    if not current_rank:
        return False
    
    # Get all ranks above current
    higher_ranks = db.query(Rank).filter(
        Rank.level > current_rank.level,
        Rank.is_active == True
    ).order_by(Rank.level).all()
    
    # Check qualification for each higher rank
    new_rank = None
    qualification_data = None
    for rank in higher_ranks:
        qualification = check_rank_qualification(db, user_id, rank)
        if qualification["qualified"]:
            new_rank = rank
            qualification_data = qualification
        else:
            break  # Stop at first unqualified rank
    
    # Update rank if qualified for higher
    if new_rank:
        old_rank = user.current_rank
        user.current_rank = new_rank.name
        user.rank_achieved_date = datetime.utcnow()
        
        # Update highest rank if applicable
        if not user.highest_rank_achieved:
            user.highest_rank_achieved = new_rank.name
        else:
            highest = get_rank_by_name(db, user.highest_rank_achieved)
            if highest and new_rank.level > highest.level:
                user.highest_rank_achieved = new_rank.name
        
        db.commit()
        
        # Award rank bonus
        award_rank_bonus(db, user_id, new_rank)
        
        # Log rank achievement
        log_activity(
            db, user_id, "rank_achieved",
            details={"old_rank": old_rank, "new_rank": new_rank.name}
        )
        
        # Send notification email
        team_size = get_team_size(db, user_id)
        asyncio.create_task(send_rank_notification(
            user.email,
            user.full_name or "Member",
            new_rank.name,
            float(new_rank.bonus_amount),
            qualification_data["total_turnover"],
            team_size
        ))
        
        return True
    
    return False

async def send_rank_notification(email: str, name: str, rank_name: str, bonus: float, turnover: float, team_size: int):
    """Send rank achievement notification email"""
    from app.services.email_service import send_rank_achievement_email
    await send_rank_achievement_email(email, name, rank_name, bonus, turnover, team_size)

def award_rank_bonus(db: Session, user_id: int, rank: Rank):
    """Award one-time rank bonus"""
    if float(rank.bonus_amount) <= 0:
        return
    
    # Check if bonus already awarded
    existing = db.query(Bonus).filter(
        Bonus.user_id == user_id,
        Bonus.bonus_type == BonusType.rank_bonus,
        Bonus.rank_achieved == rank.name
    ).first()
    
    if existing:
        return  # Already awarded
    
    # Create bonus
    bonus = Bonus(
        user_id=user_id,
        bonus_type=BonusType.rank_bonus,
        amount=rank.bonus_amount,
        currency="EUR",
        status=BonusStatus.paid,
        rank_achieved=rank.name,
        paid_date=datetime.utcnow().date()
    )
    db.add(bonus)
    
    # Create transaction
    transaction = Transaction(
        user_id=user_id,
        transaction_type=TransactionType.bonus,
        amount=rank.bonus_amount,
        currency="EUR",
        status=TransactionStatus.completed,
        description=f"Rank bonus for achieving {rank.name}",
        completed_at=datetime.utcnow()
    )
    db.add(transaction)
    
    # Update user balance
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.balance_eur += rank.bonus_amount
        user.total_earnings += rank.bonus_amount
    
    db.commit()

def get_rank_progress(db: Session, user_id: int) -> dict:
    """Get user's progress toward next rank"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    current_rank = get_rank_by_name(db, user.current_rank)
    if not current_rank:
        return None
    
    # Get next rank
    next_rank = db.query(Rank).filter(
        Rank.level == current_rank.level + 1,
        Rank.is_active == True
    ).first()
    
    if not next_rank:
        return {
            "current_rank": current_rank,
            "next_rank": None,
            "at_max_rank": True
        }
    
    # Get current turnovers
    breakdown = calculate_leg_breakdown(db, user_id)
    
    total_turnover = sum(leg["turnover"] for leg in breakdown["all_legs"]) if breakdown["all_legs"] else 0
    first_leg = breakdown["first_leg"]["turnover"] if breakdown["first_leg"] else 0
    second_leg = breakdown["second_leg"]["turnover"] if breakdown["second_leg"] else 0
    other_legs = breakdown["other_legs"]["turnover"]
    
    # Calculate progress percentages
    total_progress = (total_turnover / float(next_rank.team_turnover_required) * 100) if next_rank.team_turnover_required > 0 else 0
    first_leg_progress = (first_leg / float(next_rank.first_leg_requirement) * 100) if next_rank.first_leg_requirement > 0 else 0
    second_leg_progress = (second_leg / float(next_rank.second_leg_requirement) * 100) if next_rank.second_leg_requirement > 0 else 0
    other_legs_progress = (other_legs / float(next_rank.other_legs_requirement) * 100) if next_rank.other_legs_requirement > 0 else 0
    
    # Overall progress is the minimum of all requirements
    overall_progress = min(total_progress, first_leg_progress, second_leg_progress, other_legs_progress)
    
    return {
        "current_rank": current_rank,
        "next_rank": next_rank,
        "total_turnover": total_turnover,
        "total_turnover_progress": min(total_progress, 100),
        "first_leg_turnover": first_leg,
        "first_leg_progress": min(first_leg_progress, 100),
        "second_leg_turnover": second_leg,
        "second_leg_progress": min(second_leg_progress, 100),
        "other_legs_turnover": other_legs,
        "other_legs_progress": min(other_legs_progress, 100),
        "overall_progress": min(overall_progress, 100),
        "requirements_met": {
            "total": total_turnover >= float(next_rank.team_turnover_required),
            "first_leg": first_leg >= float(next_rank.first_leg_requirement),
            "second_leg": second_leg >= float(next_rank.second_leg_requirement),
            "other_legs": other_legs >= float(next_rank.other_legs_requirement)
        }
    }
