import hashlib
import requests
from typing import Dict, Optional
from app.core.config import settings

class GTPayService:
    """GTPay payment gateway integration"""
    
    @staticmethod
    def generate_hash(merchant_id: str, transaction_id: str, amount: str, hash_key: str) -> str:
        """Generate GTPay hash"""
        data = f"{merchant_id}{transaction_id}{amount}"
        return hashlib.sha512((data + hash_key).encode()).hexdigest()
    
    @staticmethod
    def initiate_payment(transaction_id: int, amount: float, customer_email: str, customer_name: str) -> Dict:
        """Initiate GTPay payment"""
        amount_kobo = int(amount * 100)  # Convert to kobo
        
        hash_value = GTPayService.generate_hash(
            settings.GTPAY_MERCHANT_ID,
            str(transaction_id),
            str(amount_kobo),
            settings.GTPAY_HASH_KEY
        )
        
        return {
            "gateway_url": settings.GTPAY_GATEWAY_URL,
            "merchant_id": settings.GTPAY_MERCHANT_ID,
            "transaction_id": transaction_id,
            "amount": amount_kobo,
            "hash": hash_value,
            "customer_email": customer_email,
            "customer_name": customer_name,
            "callback_url": f"{settings.FRONTEND_URL}/payment/callback"
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
    def generate_dynamic_account(transaction_id: int, customer_name: str) -> Dict:
        """Generate dynamic account number for customer"""
        headers = {
            "Authorization": f"Bearer {settings.PROVIDUS_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "merchant_id": settings.PROVIDUS_MERCHANT_ID,
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
    def get_bank_details(transaction_id: int) -> Dict:
        """Get bank transfer details"""
        return {
            "bank_name": settings.BANK_NAME,
            "account_number": settings.BANK_ACCOUNT_NUMBER,
            "account_name": settings.BANK_ACCOUNT_NAME,
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
    def get_payment_address(transaction_id: int, amount: float) -> Dict:
        """Get crypto payment address"""
        return {
            "wallet_address": settings.CRYPTO_WALLET_ADDRESS,
            "network": settings.CRYPTO_NETWORK,
            "amount_usdt": amount,
            "transaction_reference": f"CRYPTO{transaction_id:08d}",
            "instructions": [
                f"Send exactly {amount} USDT to the address above",
                f"Network: {settings.CRYPTO_NETWORK}",
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
    def initiate_payment(transaction_id: int, amount: float, customer_email: str) -> Dict:
        """Initiate Paystack payment"""
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        amount_kobo = int(amount * 100)  # Convert to kobo
        
        payload = {
            "email": customer_email,
            "amount": amount_kobo,
            "reference": f"REST{transaction_id:08d}",
            "callback_url": f"{settings.FRONTEND_URL}/payment/callback",
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
