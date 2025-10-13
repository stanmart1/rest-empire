from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.system_config import SystemConfig
from app.services.config_service import get_config, set_config, get_all_configs, delete_config
from app.utils.activity import log_activity

router = APIRouter()

class ConfigUpdate(BaseModel):
    key: str
    value: str
    description: str = None
    is_public: bool = False

class ConfigValue(BaseModel):
    value: str

@router.get("/config")
def admin_get_all_configs(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Admin: Get all system configurations"""
    return get_all_configs(db, public_only=False)

@router.get("/config/{key}")
def admin_get_config(
    key: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get specific configuration"""
    value = get_config(db, key)
    
    if value is None:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return {"key": key, "value": value}

@router.post("/config")
def admin_create_config(
    config: ConfigUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Create or update configuration"""
    old_value = get_config(db, config.key)
    
    set_config(
        db,
        config.key,
        config.value,
        config.description,
        config.is_public
    )
    
    log_activity(
        db, admin.id, "config_updated",
        entity_type="config",
        details={
            "key": config.key,
            "old_value": old_value,
            "new_value": config.value
        }
    )
    
    return {"message": "Configuration updated successfully"}

@router.put("/config/{key}")
def admin_update_config(
    key: str,
    config_value: ConfigValue,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update configuration value"""
    old_value = get_config(db, key)
    
    if old_value is None:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    set_config(db, key, config_value.value)
    
    log_activity(
        db, admin.id, "config_updated",
        entity_type="config",
        details={
            "key": key,
            "old_value": old_value,
            "new_value": config_value.value
        }
    )
    
    return {"message": "Configuration updated successfully"}

@router.delete("/config/{key}")
def admin_delete_config(
    key: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete configuration"""
    success = delete_config(db, key)
    
    if not success:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    log_activity(
        db, admin.id, "config_deleted",
        entity_type="config",
        details={"key": key}
    )
    
    return {"message": "Configuration deleted successfully"}

@router.get("/config/public/all")
def get_public_configs(db: Session = Depends(get_db)) -> Dict[str, str]:
    """Public: Get public configurations (no auth required)"""
    return get_all_configs(db, public_only=True)

@router.get("/config/settings/platform")
def admin_get_platform_settings(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get platform settings"""
    return {
        "min_payout_ngn": float(get_config(db, "min_payout_ngn", "5000")),
        "min_payout_usdt": float(get_config(db, "min_payout_usdt", "10")),
        "payout_fee_ngn": float(get_config(db, "payout_fee_ngn", "1.5")),
        "payout_fee_usdt": float(get_config(db, "payout_fee_usdt", "2.0")),
        "registration_enabled": get_config(db, "registration_enabled", "true") == "true",
        "email_verification_required": get_config(db, "email_verification_required", "true") == "true",
        "max_referral_depth": int(get_config(db, "max_referral_depth", "15"))
    }

@router.put("/config/settings/platform")
def admin_update_platform_settings(
    settings: Dict[str, str],
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update platform settings"""
    for key, value in settings.items():
        set_config(db, key, str(value))
    
    log_activity(
        db, admin.id, "platform_settings_updated",
        details=settings
    )
    
    return {"message": "Platform settings updated successfully"}
