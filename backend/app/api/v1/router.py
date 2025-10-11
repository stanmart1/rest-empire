from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, transactions, team, ranks, bonuses, 
    admin, admin_users, admin_bonuses, admin_support, admin_analytics, admin_config,
    payments, payouts, notifications, events, promo_materials, books
)

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
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(promo_materials.router, prefix="/promo-materials", tags=["Promotional Materials"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin - Finance"])
api_router.include_router(admin_users.router, prefix="/admin", tags=["Admin - Users"])
api_router.include_router(admin_bonuses.router, prefix="/admin", tags=["Admin - Bonuses"])
api_router.include_router(admin_support.router, prefix="/admin", tags=["Admin - Support"])
api_router.include_router(admin_analytics.router, prefix="/admin", tags=["Admin - Analytics"])
api_router.include_router(admin_config.router, prefix="/admin", tags=["Admin - Configuration"])
