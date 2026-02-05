from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.system_config import SystemConfig
from app.models.payment_gateway import PaymentGateway
from app.schemas.payment_gateway import PaymentGatewayCreate, PaymentGatewayUpdate, PaymentGatewayResponse
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
    admin: User = Depends(require_permission("config:view")),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Admin: Get all system configurations"""
    return get_all_configs(db, public_only=False)

@router.get("/config/{key}")
def admin_get_config(
    key: str,
    admin: User = Depends(require_permission("config:view")),
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
    admin: User = Depends(require_permission("config:view")),
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
    admin: User = Depends(require_permission("config:view")),
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
    admin: User = Depends(require_permission("config:view")),
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

@router.get("/config/public/payout-settings")
def get_public_payout_settings(db: Session = Depends(get_db)):
    """Public: Get payout settings (no auth required)"""
    unilevel_enabled = get_config(db, "unilevel_enabled")
    rank_bonus_enabled = get_config(db, "rank_bonus_enabled")
    infinity_enabled = get_config(db, "infinity_bonus_enabled")
    
    return {
        "min_payout_ngn": float(get_config(db, "min_payout_ngn") or 5000),
        "min_payout_usdt": float(get_config(db, "min_payout_usdt") or 10),
        "payout_fee_ngn": float(get_config(db, "payout_fee_ngn") or 1.5),
        "payout_fee_usdt": float(get_config(db, "payout_fee_usdt") or 2.0),
        "unilevel_enabled": unilevel_enabled == "true" if unilevel_enabled else False,
        "rank_bonus_enabled": rank_bonus_enabled == "true" if rank_bonus_enabled else False,
        "infinity_enabled": infinity_enabled == "true" if infinity_enabled else False
    }

@router.get("/config/public/system-settings")
def get_public_system_settings(db: Session = Depends(get_db)):
    """Public: Get system settings (no auth required)"""
    return {
        "registration_enabled": (get_config(db, "registration_enabled") or "true") == "true",
        "activation_packages_enabled": (get_config(db, "activation_packages_enabled") or "true") == "true"
    }

@router.get("/config/public/site-logo")
def get_public_site_logo(db: Session = Depends(get_db)):
    """Public: Get site logo URL (no auth required)"""
    logo_url = get_config(db, "site_logo")
    return {
        "logo_url": logo_url if logo_url else "/favicon.png"
    }

@router.get("/config/settings/platform")
def admin_get_platform_settings(
    admin: User = Depends(require_permission("config:view")),
    db: Session = Depends(get_db)
):
    """Admin: Get platform settings"""
    default_sponsor = get_config(db, "default_sponsor_id")
    return {
        "min_payout_ngn": float(get_config(db, "min_payout_ngn") or 5000),
        "min_payout_usdt": float(get_config(db, "min_payout_usdt") or 10),
        "payout_fee_ngn": float(get_config(db, "payout_fee_ngn") or 1.5),
        "payout_fee_usdt": float(get_config(db, "payout_fee_usdt") or 2.0),
        "registration_enabled": (get_config(db, "registration_enabled") or "true") == "true",
        "activation_packages_enabled": (get_config(db, "activation_packages_enabled") or "true") == "true",
        "kyc_required": (get_config(db, "kyc_required") or "false") == "true",
        "daily_withdrawal_limit": float(get_config(db, "daily_withdrawal_limit") or 0),
        "weekly_withdrawal_limit": float(get_config(db, "weekly_withdrawal_limit") or 0),
        "monthly_withdrawal_limit": float(get_config(db, "monthly_withdrawal_limit") or 0),
        "max_referral_depth": int(get_config(db, "max_referral_depth") or 15),
        "access_token_expire_minutes": int(get_config(db, "access_token_expire_minutes") or 30),
        "refresh_token_expire_days": int(get_config(db, "refresh_token_expire_days") or 7),
        "default_sponsor_id": int(default_sponsor) if default_sponsor else None
    }

@router.put("/config/settings/platform")
def admin_update_platform_settings(
    settings: Dict[str, str],
    admin: User = Depends(require_permission("config:view")),
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

@router.get("/payment-gateways", response_model=List[PaymentGatewayResponse])
def get_payment_gateways(
    admin: User = Depends(require_permission("config:view")),
    db: Session = Depends(get_db)
):
    """Admin: Get all payment gateways"""
    return db.query(PaymentGateway).all()

@router.post("/payment-gateways", response_model=PaymentGatewayResponse)
def create_payment_gateway(
    gateway: PaymentGatewayCreate,
    admin: User = Depends(require_permission("config:view")),
    db: Session = Depends(get_db)
):
    """Admin: Create new payment gateway"""
    db_gateway = PaymentGateway(**gateway.dict())
    db.add(db_gateway)
    db.commit()
    db.refresh(db_gateway)
    log_activity(db, admin.id, "payment_gateway_created", details={"gateway_id": db_gateway.gateway_id})
    return db_gateway

@router.put("/payment-gateways/{gateway_id}", response_model=PaymentGatewayResponse)
def update_payment_gateway(
    gateway_id: str,
    gateway_update: PaymentGatewayUpdate,
    admin: User = Depends(require_permission("config:view")),
    db: Session = Depends(get_db)
):
    """Admin: Update payment gateway"""
    db_gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == gateway_id).first()
    if not db_gateway:
        raise HTTPException(status_code=404, detail="Payment gateway not found")
    
    for key, value in gateway_update.dict(exclude_unset=True).items():
        setattr(db_gateway, key, value)
    
    db.commit()
    db.refresh(db_gateway)
    log_activity(db, admin.id, "payment_gateway_updated", details={"gateway_id": gateway_id})
    return db_gateway

@router.delete("/payment-gateways/{gateway_id}")
def delete_payment_gateway(
    gateway_id: str,
    admin: User = Depends(require_permission("config:view")),
    db: Session = Depends(get_db)
):
    """Admin: Delete payment gateway"""
    db_gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == gateway_id).first()
    if not db_gateway:
        raise HTTPException(status_code=404, detail="Payment gateway not found")
    
    db.delete(db_gateway)
    db.commit()
    log_activity(db, admin.id, "payment_gateway_deleted", details={"gateway_id": gateway_id})
    return {"message": "Payment gateway deleted successfully"}


