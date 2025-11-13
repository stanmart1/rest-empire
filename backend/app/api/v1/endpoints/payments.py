from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.payment_gateway import PaymentGateway
from app.services.payment_service import (
    GTPayService, ProvidusService, BankTransferService, CryptoPaymentService, PaystackService
)
from app.services.transaction_service import create_purchase_transaction
from app.core.storage import save_file, get_file_url

router = APIRouter()

class PaymentInitiate(BaseModel):
    amount: float
    currency: str  # USDT or NGN
    payment_method: str  # gtpay, providus, bank_transfer, crypto

class PaymentVerify(BaseModel):
    transaction_id: int
    payment_reference: Optional[str] = None
    transaction_hash: Optional[str] = None

@router.post("/initiate")
def initiate_payment(
    payment: PaymentInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate payment with selected gateway"""
    if payment.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    # Validate currency
    if payment.currency not in ["USDT", "NGN"]:
        raise HTTPException(status_code=400, detail="Currency must be USDT or NGN")
    
    # Validate payment method for currency
    if payment.currency == "USDT" and payment.payment_method != "crypto":
        raise HTTPException(status_code=400, detail="USDT only supports crypto payment")
    
    if payment.currency == "NGN" and payment.payment_method == "crypto":
        raise HTTPException(status_code=400, detail="Crypto payment only supports USDT")
    
    # Create transaction
    transaction = create_purchase_transaction(
        db,
        current_user.id,
        payment.amount,
        payment.currency,
        payment.payment_method
    )
    
    # Get payment details based on method
    if payment.payment_method == "gtpay":
        payment_data = GTPayService.initiate_payment(
            transaction.id,
            payment.amount,
            current_user.email,
            current_user.full_name or current_user.email,
            db
        )
        return {
            "transaction_id": transaction.id,
            "payment_method": "gtpay",
            "currency": "NGN",
            "payment_data": payment_data
        }
    
    elif payment.payment_method == "providus":
        payment_data = ProvidusService.initiate_payment(
            transaction.id,
            payment.amount,
            current_user.email,
            current_user.full_name or current_user.email,
            db
        )
        return {
            "transaction_id": transaction.id,
            "payment_method": "providus",
            "currency": "NGN",
            "payment_data": payment_data
        }
    
    elif payment.payment_method == "bank_transfer":
        payment_data = BankTransferService.get_bank_details(transaction.id, db)
        return {
            "transaction_id": transaction.id,
            "payment_method": "bank_transfer",
            "currency": "NGN",
            "payment_data": payment_data
        }
    
    elif payment.payment_method == "crypto":
        payment_data = CryptoPaymentService.get_payment_address(
            transaction.id,
            payment.amount,
            db
        )
        return {
            "transaction_id": transaction.id,
            "payment_method": "crypto",
            "currency": "USDT",
            "payment_data": payment_data
        }
    
    elif payment.payment_method == "paystack":
        payment_data = PaystackService.initiate_payment(
            transaction.id,
            payment.amount,
            current_user.email,
            db
        )
        if payment_data.get("error"):
            raise HTTPException(status_code=500, detail=payment_data["error"])
        return {
            "transaction_id": transaction.id,
            "payment_method": "paystack",
            "currency": "NGN",
            "payment_data": payment_data
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method")

@router.post("/verify")
def verify_payment(
    verification: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify payment (for crypto and manual verification)"""
    transaction = db.query(Transaction).filter(
        Transaction.id == verification.transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Store verification data
    transaction.payment_reference = verification.payment_reference or verification.transaction_hash
    db.commit()
    
    return {
        "message": "Payment verification submitted. Awaiting confirmation.",
        "transaction_id": transaction.id,
        "status": "pending_verification"
    }

@router.post("/upload-proof/{transaction_id}")
async def upload_payment_proof(
    transaction_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload payment proof for bank transfer"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Save payment proof
    import uuid
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{transaction_id}_{uuid.uuid4()}.{file_extension}" if file_extension else f"{transaction_id}_{uuid.uuid4()}"
    
    file_data = await file.read()
    file_path = save_file(file_data, unique_filename, "payment_proofs")
    file_url = get_file_url(file_path)
    
    transaction.meta_data = {
        "proof_filename": file.filename,
        "proof_file_path": file_path,
        "proof_file_url": file_url,
        "proof_uploaded": True
    }
    db.commit()
    
    return {
        "message": "Payment proof uploaded successfully",
        "transaction_id": transaction.id
    }

@router.get("/methods")
def get_payment_methods(db: Session = Depends(get_db)):
    """Get available payment methods (only enabled gateways)"""
    enabled_gateways = db.query(PaymentGateway).filter(PaymentGateway.is_enabled == True).all()
    
    gateway_info = {
        "gtpay": {"description": "Pay with GTBank or other Nigerian banks", "currency": "NGN", "instant": True},
        "providus": {"description": "Pay with Providus Bank payment gateway", "currency": "NGN", "instant": True},
        "bank_transfer": {"description": "Manual bank transfer (24hr confirmation)", "currency": "NGN", "instant": False},
        "paystack": {"description": "Pay with card, bank transfer, or USSD", "currency": "NGN", "instant": True},
        "crypto": {"description": "Pay with USDT on TRC20 network", "currency": "USDT", "instant": True}
    }
    
    methods = []
    for gateway in enabled_gateways:
        info = gateway_info.get(gateway.gateway_id, {})
        methods.append({
            "id": gateway.gateway_id,
            "name": gateway.name,
            "description": info.get("description", "Payment gateway"),
            "currency": info.get("currency", "NGN"),
            "instant": info.get("instant", True)
        })
    
    return {
        "currencies": ["USDT", "NGN"],
        "methods": methods
    }
