import resend
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.config_service import get_config
from pathlib import Path

def load_template(template_name: str, **kwargs) -> str:
    template_path = Path(__file__).parent.parent / "templates" / template_name
    with open(template_path, 'r') as f:
        template = f.read()
    
    for key, value in kwargs.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    
    return template

async def send_verification_email(email: str, token: str, db: Session):
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html_content = load_template("verify_email.html", verification_url=verification_url)
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": "Verify Your Email - Rest Empire",
            "html": html_content
        })

async def send_password_reset_email(email: str, token: str, db: Session):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html_content = load_template("reset_password.html", reset_url=reset_url)
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": "Password Reset - Rest Empire",
            "html": html_content
        })

async def send_welcome_email(email: str, name: str, db: Session):
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    html_content = load_template("welcome.html", name=name, dashboard_url=dashboard_url)
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": "Welcome to Rest Empire!",
            "html": html_content
        })

async def send_rank_achievement_email(email: str, user_name: str, rank_name: str, bonus_amount: float, total_turnover: float, team_size: int, db: Session):
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    html_content = load_template(
        "rank_achievement.html",
        user_name=user_name,
        rank_name=rank_name,
        bonus_amount=f"{bonus_amount:,.2f}",
        total_turnover=f"{total_turnover:,.2f}",
        team_size=team_size,
        dashboard_url=dashboard_url
    )
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": f"🎉 Congratulations! You've Achieved {rank_name} - Rest Empire",
            "html": html_content
        })

async def send_bonus_earned_email(email: str, bonus_type: str, amount: float, new_balance: float, db: Session):
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    html_content = load_template(
        "bonus_earned.html",
        bonus_type=bonus_type,
        amount=f"{amount:,.2f}",
        new_balance=f"{new_balance:,.2f}",
        dashboard_url=dashboard_url
    )
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": f"💰 Bonus Earned: €{amount:,.2f} - Rest Empire",
            "html": html_content
        })

async def send_payout_processed_email(email: str, status: str, amount: float, method: str, reference: str, expected_arrival: str, db: Session):
    payouts_url = f"{settings.FRONTEND_URL}/payouts"
    html_content = load_template(
        "payout_processed.html",
        status=status,
        amount=f"{amount:,.2f}",
        method=method,
        reference=reference,
        expected_arrival=expected_arrival,
        payouts_url=payouts_url
    )
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": f"Payout {status.title()} - Rest Empire",
            "html": html_content
        })

async def send_team_member_joined_email(email: str, member_name: str, member_email: str, team_size: int, first_line: int, db: Session):
    team_url = f"{settings.FRONTEND_URL}/team"
    html_content = load_template(
        "team_member_joined.html",
        member_name=member_name,
        member_email=member_email,
        team_size=team_size,
        first_line=first_line,
        team_url=team_url
    )
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": "🎉 New Team Member Joined - Rest Empire",
            "html": html_content
        })

async def send_security_alert_email(email: str, action: str, timestamp: str, location: str, device: str, db: Session):
    security_url = f"{settings.FRONTEND_URL}/settings/security"
    html_content = load_template(
        "security_alert.html",
        action=action,
        timestamp=timestamp,
        location=location,
        device=device,
        security_url=security_url
    )
    
    api_key = get_config(db, "resend_api_key", settings.RESEND_API_KEY)
    from_email = get_config(db, "from_email", settings.MAIL_FROM)
    
    if api_key:
        resend.api_key = api_key
        resend.Emails.send({
            "from": from_email,
            "to": email,
            "subject": "🔒 Security Alert - Rest Empire",
            "html": html_content
        })
