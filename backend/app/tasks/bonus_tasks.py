from celery import Celery
from app.core.config import settings
from app.core.database import SessionLocal
from app.services.bonus_engine import calculate_infinity_bonus
from datetime import datetime

celery_app = Celery(
    "rest_empire",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

@celery_app.task
def calculate_monthly_infinity_bonuses():
    """Calculate infinity bonuses for the previous month"""
    db = SessionLocal()
    try:
        # Get previous month
        now = datetime.utcnow()
        if now.month == 1:
            month = 12
            year = now.year - 1
        else:
            month = now.month - 1
            year = now.year
        
        bonuses = calculate_infinity_bonus(db, month, year)
        return {
            "success": True,
            "month": month,
            "year": year,
            "bonuses_created": len(bonuses)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

@celery_app.task
def recalculate_all_ranks():
    """Recalculate ranks for all users (daily batch job)"""
    from app.services.rank_service import calculate_user_rank
    from app.models.user import User
    
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == True).all()
        updated_count = 0
        
        for user in users:
            if calculate_user_rank(db, user.id):
                updated_count += 1
        
        return {
            "success": True,
            "users_checked": len(users),
            "ranks_updated": updated_count
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

# Schedule tasks
celery_app.conf.beat_schedule = {
    'calculate-infinity-bonuses-monthly': {
        'task': 'app.tasks.bonus_tasks.calculate_monthly_infinity_bonuses',
        'schedule': 86400.0,  # Daily check (will only run on 1st of month)
    },
    'recalculate-ranks-daily': {
        'task': 'app.tasks.bonus_tasks.recalculate_all_ranks',
        'schedule': 86400.0,  # Daily
    },
}
