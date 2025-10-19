from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.services.config_service import get_config
from app.services.config_service import set_config
from app.utils.activity import log_activity
import resend

router = APIRouter()

@router.get("/email-settings")
def get_email_settings(
    admin: User = Depends(require_permission("config:email_settings")),
    db: Session = Depends(get_db)
):
    """Admin: Get email settings"""
    return {
        "smtp_host": get_config(db, "smtp_host", ""),
        "smtp_port": int(get_config(db, "smtp_port", "587")),
        "smtp_username": get_config(db, "smtp_username", ""),
        "smtp_password": get_config(db, "smtp_password", ""),
        "from_email": get_config(db, "from_email", ""),
        "from_name": get_config(db, "from_name", ""),
        "resend_api_key": get_config(db, "resend_api_key", "")
    }

@router.put("/email-settings")
def update_email_settings(
    settings: Dict[str, Any],
    admin: User = Depends(require_permission("config:email_settings")),
    db: Session = Depends(get_db)
):
    """Admin: Update email settings"""
    for key, value in settings.items():
        set_config(db, key, str(value))
    
    log_activity(db, admin.id, "email_settings_updated")
    return {"message": "Email settings updated successfully"}

class TestEmailRequest(BaseModel):
    email: EmailStr

@router.post("/test-email")
async def send_test_email(
    request: TestEmailRequest,
    admin: User = Depends(require_permission("config:email_settings")),
    db: Session = Depends(get_db)
):
    """Admin: Send test email"""
    api_key = get_config(db, "resend_api_key", "")
    from_email = get_config(db, "from_email", "")
    
    if not api_key:
        return {"success": False, "message": "Resend API key not configured"}
    
    resend.api_key = api_key
    resend.Emails.send({
        "from": from_email,
        "to": request.email,
        "subject": "Test Email - Rest Empire",
        "html": "<h1>Test Email</h1><p>This is a test email from Rest Empire. Your email configuration is working correctly!</p>"
    })
    
    log_activity(db, admin.id, "test_email_sent")
    return {"success": True, "message": "Test email sent successfully"}
