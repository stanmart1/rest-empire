from pydantic import BaseModel

class NotificationPreferencesResponse(BaseModel):
    email_new_team_member: bool
    email_bonus_earned: bool
    email_rank_achieved: bool
    email_payout_status: bool
    email_transaction_completed: bool
    email_security_alerts: bool
    email_marketing: bool
    inapp_new_team_member: bool
    inapp_bonus_earned: bool
    inapp_rank_achieved: bool
    inapp_payout_status: bool
    inapp_transaction_completed: bool
    
    class Config:
        from_attributes = True

class NotificationPreferencesUpdate(BaseModel):
    email_new_team_member: bool = None
    email_bonus_earned: bool = None
    email_rank_achieved: bool = None
    email_payout_status: bool = None
    email_transaction_completed: bool = None
    email_security_alerts: bool = None
    email_marketing: bool = None
    inapp_new_team_member: bool = None
    inapp_bonus_earned: bool = None
    inapp_rank_achieved: bool = None
    inapp_payout_status: bool = None
    inapp_transaction_completed: bool = None
