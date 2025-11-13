import hashlib
import requests
import logging
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.payment_gateway import PaymentGateway
from app.utils.retry import retry_on_exception

logger = logging.getLogger(__name__)

class GTPayService:
    """GTPay payment gateway integration"""
    
    @staticmethod
    def generate_hash(merchant_id: str, transaction_id: str, amount: str, hash_key: str) -> str:
        """Generate GTPay hash"""
        data = f"{merchant_id}{transaction_id}{amount}"
        return hashlib.sha512((data + hash_key).encode()).hexdigest()
    
    @staticmethod
    def initiate_payment(transaction_id: int, amount: float, customer_email: str, customer_name: str, db: Session = None) -> Dict:
        """Initiate GTPay payment"""
        from app.utils.payment_helpers import get_gtpay_config
        
        config = get_gtpay_config(db)
        merchant_id = config["merchant_id"]
        api_key = config["api_key"]
        callback_url = config["callback_url"]
        
        amount_kobo = int(amount * 100)  # Convert to kobo
        
        hash_value = GTPayService.generate_hash(
            merchant_id,
            str(transaction_id),
            str(amount_kobo),
            api_key
        )
        
        return {
            "gateway_url": settings.GTPAY_GATEWAY_URL,
            "merchant_id": merchant_id,
            "transaction_id": transaction_id,
            "amount": amount_kobo,
            "hash": hash_value,
            "customer_email": customer_email,
            "customer_name": customer_name,
            "callback_url": callback_url
        }
    
    @staticmethod
    def verify_payment(transaction_id: str, amount: str, hash_received: str) -> bool:
        """Verify GTPay payment"""
        expected_hash = GTPayService.generate_hash(
            settings.GTPAY_MERCHANT_ID,
            transaction_id,
            amount,
            settings.GTPAY_HASH_KEY
        )
        return hash_received == expected_hash

class ProvidusService:
    """Providus Bank payment processing integration"""
    
    @staticmethod
    def initiate_payment(transaction_id: int, amount: float, customer_email: str, customer_name: str, db: Session = None) -> Dict:
        """Initiate Providus payment"""
        from app.utils.payment_helpers import get_providus_config
        
        config = get_providus_config(db)
        merchant_id = config["merchant_id"]
        api_key = config["api_key"]
        callback_url = config["callback_url"]
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "merchant_id": merchant_id,
            "transaction_reference": f"REST{transaction_id:08d}",
            "amount": amount,
            "customer_email": customer_email,
            "customer_name": customer_name,
            "callback_url": callback_url
        }
        
        # Note: Replace with actual Providus payment API endpoint
        # response = requests.post(f"{settings.PROVIDUS_API_URL}/api/v1/payment/initiate", json=payload, headers=headers)
        # return response.json()
        
        # Mock response - replace with actual API response
        return {
            "payment_url": f"https://providusbank.com/pay?ref=REST{transaction_id:08d}",
            "reference": f"REST{transaction_id:08d}",
            "merchant_id": merchant_id
        }
    
    @staticmethod
    def verify_payment(transaction_reference: str) -> Dict:
        """Verify Providus payment"""
        headers = {
            "Authorization": f"Bearer {settings.PROVIDUS_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Note: Replace with actual Providus API endpoint
        # response = requests.get(f"{settings.PROVIDUS_API_URL}/api/v1/payment/verify/{transaction_reference}", headers=headers)
        # return response.json()
        
        return {
            "status": "success",
            "amount": 0,
            "reference": transaction_reference
        }

class BankTransferService:
    """Manual bank transfer"""
    
    @staticmethod
    def get_bank_details(transaction_id: int, db: Session = None) -> Dict:
        """Get bank transfer details"""
        from app.utils.payment_helpers import get_bank_transfer_config
        
        config = get_bank_transfer_config(db)
        accounts = config.get("accounts", [])
        
        return {
            "accounts": accounts,
            "transaction_reference": f"REST{transaction_id:08d}",
            "instructions": [
                "Transfer the exact amount to any of the accounts above",
                "Use the transaction reference as your payment description",
                "Upload proof of payment after transfer",
                "Payment will be confirmed within 24 hours"
            ]
        }

class CryptoPaymentService:
    """Cryptocurrency payment (USDT TRC20)"""
    
    @staticmethod
    def get_payment_address(transaction_id: int, amount: float, db: Session = None) -> Dict:
        """Get crypto payment address"""
        from app.utils.payment_helpers import get_crypto_config
        
        config = get_crypto_config(db)
        wallet_address = config["wallet_address"]
        network = config["network"]
        
        return {
            "wallet_address": wallet_address,
            "network": network,
            "amount_usdt": amount,
            "transaction_reference": f"CRYPTO{transaction_id:08d}",
            "instructions": [
                f"Send exactly {amount} USDT to the address above",
                f"Network: {network}",
                "Do not send any other cryptocurrency",
                "Payment will be confirmed after 1 network confirmation"
            ]
        }
    
    @staticmethod
    def verify_payment(transaction_hash: str) -> Dict:
        """Verify crypto payment on blockchain"""
        # Note: Integrate with blockchain API (e.g., TronScan API)
        # For now, return mock response
        return {
            "status": "confirmed",
            "amount": 0,
            "confirmations": 1,
            "transaction_hash": transaction_hash
        }

class PaystackService:
    """Paystack payment gateway integration"""
    
    @staticmethod
    @retry_on_exception(max_attempts=3, delay=1.0, exceptions=(requests.RequestException,))
    def initiate_payment(transaction_id: int, amount: float, customer_email: str, db: Session = None) -> Dict:
        """Initiate Paystack payment with retry logic"""
        from app.utils.payment_helpers import get_paystack_config
        
        try:
            config = get_paystack_config(db)
            secret_key = config["secret_key"]
            callback_url = config["callback_url"]
            
            headers = {
                "Authorization": f"Bearer {secret_key}",
                "Content-Type": "application/json"
            }
            
            amount_kobo = int(amount * 100)  # Convert to kobo
            
            payload = {
                "email": customer_email,
                "amount": amount_kobo,
                "reference": f"REST{transaction_id:08d}",
                "callback_url": callback_url,
                "metadata": {
                    "transaction_id": transaction_id
                }
            }
            
            response = requests.post(
                "https://api.paystack.co/transaction/initialize",
                json=payload,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Paystack payment initiated for transaction {transaction_id}")
            return {
                "authorization_url": data["data"]["authorization_url"],
                "access_code": data["data"]["access_code"],
                "reference": data["data"]["reference"]
            }
        except requests.RequestException as e:
            logger.error(f"Paystack API error for transaction {transaction_id}: {str(e)}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Unexpected error initiating Paystack payment: {str(e)}", exc_info=True)
            return {
                "error": str(e),
                "authorization_url": None
            }
    
    @staticmethod
    @retry_on_exception(max_attempts=3, delay=1.0, exceptions=(requests.RequestException,))
    def verify_payment(reference: str) -> Dict:
        """Verify Paystack payment with retry logic"""
        try:
            headers = {
                "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{reference}",
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Paystack payment verified: {reference}")
            return {
                "status": data["data"]["status"],
                "amount": data["data"]["amount"] / 100,  # Convert from kobo
                "reference": data["data"]["reference"],
                "paid_at": data["data"]["paid_at"]
            }
        except requests.RequestException as e:
            logger.error(f"Paystack verification error for {reference}: {str(e)}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Unexpected error verifying Paystack payment: {str(e)}", exc_info=True)
            return {
                "status": "failed",
                "error": str(e)
            }
