from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, transactions, team, ranks, bonuses, admin, payments, payouts, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(team.router, prefix="/team", tags=["Team"])
api_router.include_router(ranks.router, prefix="/ranks", tags=["Ranks"])
api_router.include_router(bonuses.router, prefix="/bonuses", tags=["Bonuses"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(payouts.router, prefix="/payouts", tags=["Payouts"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
