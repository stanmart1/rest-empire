from sqlalchemy.orm import Session
from app.models.system_config import SystemConfig
from typing import Optional, Dict
import json

def get_config(db: Session, key: str, default: str = None) -> Optional[str]:
    """Get configuration value by key"""
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    return config.value if config else default

def set_config(db: Session, key: str, value: str, description: str = None, is_public: bool = False):
    """Set configuration value"""
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    
    if config:
        config.value = value
        if description:
            config.description = description
        config.is_public = is_public
    else:
        config = SystemConfig(
            key=key,
            value=value,
            description=description,
            is_public=is_public
        )
        db.add(config)
    
    db.commit()
    return config

def get_all_configs(db: Session, public_only: bool = False) -> Dict[str, str]:
    """Get all configuration values"""
    query = db.query(SystemConfig)
    
    if public_only:
        query = query.filter(SystemConfig.is_public == True)
    
    configs = query.all()
    return {c.key: c.value for c in configs}

def delete_config(db: Session, key: str) -> bool:
    """Delete configuration"""
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    
    if config:
        db.delete(config)
        db.commit()
        return True
    
    return False

# Default configurations
DEFAULT_CONFIGS = {
    "min_payout_ngn": "5000",
    "min_payout_usdt": "10",
    "payout_fee_ngn": "1.5",
    "payout_fee_usdt": "2.0",
    "maintenance_mode": "false",
    "registration_enabled": "true",
    "email_verification_required": "true",
    "max_referral_depth": "15",
}

def initialize_default_configs(db: Session):
    """Initialize default configurations if not exists"""
    for key, value in DEFAULT_CONFIGS.items():
        existing = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if not existing:
            config = SystemConfig(key=key, value=value, is_public=True)
            db.add(config)
    
    db.commit()
