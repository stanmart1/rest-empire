from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionStatus
from app.models.bonus import Bonus, BonusStatus
from app.models.payout import Payout, PayoutStatus

router = APIRouter()

@router.get("/analytics/dashboard")
def admin_get_dashboard_analytics(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get comprehensive dashboard analytics"""
    # User stats
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    
    # Today's stats
    today = datetime.utcnow().date()
    new_users_today = db.query(User).filter(
        func.date(User.created_at) == today
    ).count()
    
    # Transaction stats
    total_revenue = db.query(func.sum(Transaction.amount)).filter(
        Transaction.status == TransactionStatus.completed,
        Transaction.transaction_type == "purchase"
    ).scalar() or 0
    
    revenue_today = db.query(func.sum(Transaction.amount)).filter(
        Transaction.status == TransactionStatus.completed,
        Transaction.transaction_type == "purchase",
        func.date(Transaction.created_at) == today
    ).scalar() or 0
    
    # Bonus stats
    total_bonuses = db.query(func.sum(Bonus.amount)).filter(
        Bonus.status == BonusStatus.paid
    ).scalar() or 0
    
    # Payout stats
    pending_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status.in_([PayoutStatus.pending, PayoutStatus.approved])
    ).scalar() or 0
    
    completed_payouts = db.query(func.sum(Payout.amount)).filter(
        Payout.status == PayoutStatus.completed
    ).scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "verified": verified_users,
            "new_today": new_users_today
        },
        "revenue": {
            "total": float(total_revenue),
            "today": float(revenue_today)
        },
        "bonuses": {
            "total_paid": float(total_bonuses)
        },
        "payouts": {
            "pending": float(pending_payouts),
            "completed": float(completed_payouts)
        }
    }

@router.get("/analytics/users")
def admin_get_user_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get user growth analytics"""
    # Calculate date range
    if period == "7d":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == "30d":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == "90d":
        start_date = datetime.utcnow() - timedelta(days=90)
    else:
        start_date = datetime.utcnow() - timedelta(days=365)
    
    # User growth
    user_growth = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(func.date(User.created_at)).all()
    
    # Rank distribution
    rank_distribution = db.query(
        User.current_rank,
        func.count(User.id)
    ).group_by(User.current_rank).all()
    
    return {
        "user_growth": [
            {"date": str(g.date), "count": g.count}
            for g in user_growth
        ],
        "rank_distribution": [
            {"rank": r, "count": count}
            for r, count in rank_distribution
        ]
    }

@router.get("/analytics/financial")
def admin_get_financial_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get financial analytics"""
    # Calculate date range
    if period == "7d":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == "30d":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == "90d":
        start_date = datetime.utcnow() - timedelta(days=90)
    else:
        start_date = datetime.utcnow() - timedelta(days=365)
    
    # Revenue by day
    revenue_by_day = db.query(
        func.date(Transaction.created_at).label('date'),
        func.sum(Transaction.amount).label('revenue')
    ).filter(
        Transaction.status == TransactionStatus.completed,
        Transaction.transaction_type == "purchase",
        Transaction.created_at >= start_date
    ).group_by(func.date(Transaction.created_at)).all()
    
    # Bonuses by day
    bonuses_by_day = db.query(
        func.date(Bonus.created_at).label('date'),
        func.sum(Bonus.amount).label('bonuses')
    ).filter(
        Bonus.status == BonusStatus.paid,
        Bonus.created_at >= start_date
    ).group_by(func.date(Bonus.created_at)).all()
    
    # Payouts by day
    payouts_by_day = db.query(
        func.date(Payout.completed_at).label('date'),
        func.sum(Payout.amount).label('payouts')
    ).filter(
        Payout.status == PayoutStatus.completed,
        Payout.completed_at >= start_date
    ).group_by(func.date(Payout.completed_at)).all()
    
    return {
        "revenue_trend": [
            {"date": str(r.date), "amount": float(r.revenue)}
            for r in revenue_by_day
        ],
        "bonus_trend": [
            {"date": str(b.date), "amount": float(b.bonuses)}
            for b in bonuses_by_day
        ],
        "payout_trend": [
            {"date": str(p.date), "amount": float(p.payouts)}
            for p in payouts_by_day
        ]
    }
