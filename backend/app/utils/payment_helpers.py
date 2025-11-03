from sqlalchemy.orm import Session
from typing import Dict, Optional
from app.core.config import settings
from app.models.payment_gateway import PaymentGateway

def get_gateway_config(db: Session, gateway_id: str, default_config: Dict) -> Dict:
    """Get payment gateway configuration from database or use defaults"""
    if not db:
        return default_config
    
    gateway = db.query(PaymentGateway).filter(
        PaymentGateway.gateway_id == gateway_id
    ).first()
    
    if gateway and gateway.config_values:
        # Merge database config with defaults
        return {**default_config, **gateway.config_values}
    
    return default_config

def get_paystack_config(db: Session = None) -> Dict:
    """Get Paystack configuration"""
    default = {
        "secret_key": settings.PAYSTACK_SECRET_KEY,
        "callback_url": f"{settings.FRONTEND_URL}/payment/callback"
    }
    return get_gateway_config(db, "paystack", default)

def get_gtpay_config(db: Session = None) -> Dict:
    """Get GTPay configuration"""
    default = {
        "merchant_id": settings.GTPAY_MERCHANT_ID,
        "api_key": settings.GTPAY_HASH_KEY,
        "callback_url": f"{settings.FRONTEND_URL}/payment/callback"
    }
    return get_gateway_config(db, "gtpay", default)

def get_providus_config(db: Session = None) -> Dict:
    """Get Providus configuration"""
    default = {
        "merchant_id": settings.PROVIDUS_MERCHANT_ID,
        "api_key": settings.PROVIDUS_API_KEY,
        "callback_url": f"{settings.FRONTEND_URL}/payment/callback"
    }
    return get_gateway_config(db, "providus", default)

def get_bank_transfer_config(db: Session = None) -> Dict:
    """Get Bank Transfer configuration"""
    default = {
        "bank_name": settings.BANK_NAME,
        "account_number": settings.BANK_ACCOUNT_NUMBER,
        "account_name": settings.BANK_ACCOUNT_NAME
    }
    return get_gateway_config(db, "bank_transfer", default)

def get_crypto_config(db: Session = None) -> Dict:
    """Get Crypto payment configuration"""
    default = {
        "wallet_address": settings.CRYPTO_WALLET_ADDRESS,
        "network": settings.CRYPTO_NETWORK
    }
    return get_gateway_config(db, "crypto", default)
