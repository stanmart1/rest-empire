from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from pathlib import Path

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_TLS,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def load_template(template_name: str, **kwargs) -> str:
    template_path = Path(__file__).parent.parent / "templates" / template_name
    with open(template_path, 'r') as f:
        template = f.read()
    
    for key, value in kwargs.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    
    return template

async def send_verification_email(email: str, token: str):
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    
    html_content = load_template("verify_email.html", verification_url=verification_url)
    
    message = MessageSchema(
        subject="Verify Your Email - Rest Empire",
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    if settings.MAIL_USERNAME or settings.RESEND_API_KEY:
        fm = FastMail(conf)
        await fm.send_message(message)

async def send_password_reset_email(email: str, token: str):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    html_content = load_template("reset_password.html", reset_url=reset_url)
    
    message = MessageSchema(
        subject="Password Reset - Rest Empire",
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    if settings.MAIL_USERNAME or settings.RESEND_API_KEY:
        fm = FastMail(conf)
        await fm.send_message(message)

async def send_welcome_email(email: str, name: str):
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    
    html_content = load_template("welcome.html", name=name, dashboard_url=dashboard_url)
    
    message = MessageSchema(
        subject="Welcome to Rest Empire!",
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    if settings.MAIL_USERNAME or settings.RESEND_API_KEY:
        fm = FastMail(conf)
        await fm.send_message(message)

async def send_rank_achievement_email(email: str, user_name: str, rank_name: str, bonus_amount: float, total_turnover: float, team_size: int):
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
    
    message = MessageSchema(
        subject=f"🎉 Congratulations! You've Achieved {rank_name} - Rest Empire",
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    if settings.MAIL_USERNAME or settings.RESEND_API_KEY:
        fm = FastMail(conf)
        await fm.send_message(message)
