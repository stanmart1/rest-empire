import hashlib
import requests
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.payment_gateway import PaymentGateway

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
        merchant_id = settings.GTPAY_MERCHANT_ID
        api_key = settings.GTPAY_HASH_KEY
        callback_url = f"{settings.FRONTEND_URL}/payment/callback"
        
        if db:
            gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == "gtpay").first()
            if gateway and gateway.config_values:
                merchant_id = gateway.config_values.get("merchant_id", merchant_id)
                api_key = gateway.config_values.get("api_key", api_key)
                callback_url = gateway.config_values.get("callback_url", callback_url)
        
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
    """Providus Bank payment integration"""
    
    @staticmethod
    def generate_dynamic_account(transaction_id: int, customer_name: str, db: Session = None) -> Dict:
        """Generate dynamic account number for customer"""
        account_number = settings.PROVIDUS_MERCHANT_ID
        bank_code = ""
        api_key = settings.PROVIDUS_API_KEY
        
        if db:
            gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == "providus").first()
            if gateway and gateway.config_values:
                account_number = gateway.config_values.get("account_number", account_number)
                bank_code = gateway.config_values.get("bank_code", bank_code)
                api_key = gateway.config_values.get("api_key", api_key)
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "merchant_id": account_number,
            "transaction_reference": str(transaction_id),
            "customer_name": customer_name
        }
        
        # Note: Replace with actual Providus API endpoint
        # response = requests.post(f"{settings.PROVIDUS_API_URL}/api/v1/account/generate", json=payload, headers=headers)
        
        # Mock response for now
        return {
            "account_number": f"9{transaction_id:09d}",  # Dynamic account
            "account_name": customer_name,
            "bank_name": settings.BANK_NAME,
            "transaction_reference": str(transaction_id)
        }
    
    @staticmethod
    def verify_payment(transaction_reference: str) -> Dict:
        """Verify Providus payment"""
        headers = {
            "Authorization": f"Bearer {settings.PROVIDUS_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Note: Replace with actual Providus API endpoint
        # response = requests.get(f"{settings.PROVIDUS_API_URL}/api/v1/transaction/{transaction_reference}", headers=headers)
        
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
        bank_name = settings.BANK_NAME
        account_number = settings.BANK_ACCOUNT_NUMBER
        account_name = settings.BANK_ACCOUNT_NAME
        
        if db:
            gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == "bank_transfer").first()
            if gateway and gateway.config_values:
                bank_name = gateway.config_values.get("bank_name", bank_name)
                account_number = gateway.config_values.get("account_number", account_number)
                account_name = gateway.config_values.get("account_name", account_name)
        
        return {
            "bank_name": bank_name,
            "account_number": account_number,
            "account_name": account_name,
            "transaction_reference": f"REST{transaction_id:08d}",
            "instructions": [
                "Transfer the exact amount to the account above",
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
        wallet_address = settings.CRYPTO_WALLET_ADDRESS
        network = settings.CRYPTO_NETWORK
        
        if db:
            gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == "crypto").first()
            if gateway and gateway.config_values:
                wallet_address = gateway.config_values.get("wallet_address", wallet_address)
        
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
    def initiate_payment(transaction_id: int, amount: float, customer_email: str, db: Session = None) -> Dict:
        """Initiate Paystack payment"""
        secret_key = settings.PAYSTACK_SECRET_KEY
        callback_url = f"{settings.FRONTEND_URL}/payment/callback"
        
        if db:
            gateway = db.query(PaymentGateway).filter(PaymentGateway.gateway_id == "paystack").first()
            if gateway and gateway.config_values:
                secret_key = gateway.config_values.get("secret_key", secret_key)
                callback_url = gateway.config_values.get("callback_url", callback_url)
        
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
        
        try:
            response = requests.post(
                "https://api.paystack.co/transaction/initialize",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "authorization_url": data["data"]["authorization_url"],
                "access_code": data["data"]["access_code"],
                "reference": data["data"]["reference"]
            }
        except Exception as e:
            return {
                "error": str(e),
                "authorization_url": None
            }
    
    @staticmethod
    def verify_payment(reference: str) -> Dict:
        """Verify Paystack payment"""
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{reference}",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "status": data["data"]["status"],
                "amount": data["data"]["amount"] / 100,  # Convert from kobo
                "reference": data["data"]["reference"],
                "paid_at": data["data"]["paid_at"]
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e)
            }
