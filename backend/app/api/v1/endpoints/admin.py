from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.payout import Payout, PayoutStatus
from app.models.verification import UserVerification, VerificationStatus
from app.schemas.transaction import TransactionResponse
from app.schemas.payout import PayoutResponse
from app.schemas.admin import AdminStatsResponse, ManualTransaction, RefundRequest, PayoutApproval, PayoutRejection
from app.services.transaction_service import refund_transaction, fail_transaction
from app.services.payout_service import approve_payout, complete_payout, reject_payout
from app.services.email_service import send_payout_processed_email
from app.utils.activity import log_activity
import asyncio

router = APIRouter()

@router.get("/transactions/stats")
def admin_get_transaction_stats(
    admin: User = Depends(require_permission("transactions:list")),
    db: Session = Depends(get_db)
):
    """Admin: Get transaction statistics by type"""
    from sqlalchemy import func
    
    stats = db.query(
        Transaction.transaction_type,
        func.count(Transaction.id).label('count')
    ).filter(
        Transaction.status == TransactionStatus.completed
    ).group_by(Transaction.transaction_type).all()
    
    return {
        "by_type": [
            {"type": t.transaction_type.value.capitalize(), "count": t.count}
            for t in stats
        ]
    }

@router.get("/transactions", response_model=List[TransactionResponse])
def admin_get_all_transactions(
    user_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_permission("transactions:list")),
    db: Session = Depends(get_db)
):
    """Admin: Get all transactions with filters"""
    query = db.query(Transaction)
    
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    transactions = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return transactions

@router.post("/transactions/manual")
def admin_create_manual_transaction(
    transaction: ManualTransaction,
    admin: User = Depends(require_permission("transactions:create")),
    db: Session = Depends(get_db)
):
    """Admin: Create manual transaction (adjustment)"""
    user = db.query(User).filter(User.id == transaction.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create transaction
    new_transaction = Transaction(
        user_id=transaction.user_id,
        transaction_type=TransactionType[transaction.transaction_type],
        amount=transaction.amount,
        currency=transaction.currency,
        status=TransactionStatus.completed,
        description=transaction.description,
        completed_at=datetime.utcnow(),
        meta_data={"created_by_admin": admin.id}
    )
    db.add(new_transaction)
    
    # Update user balance
    if transaction.currency == "NGN":
        user.balance_ngn += transaction.amount
    elif transaction.currency == "USDT":
        user.balance_usdt += transaction.amount
    
    if transaction.amount > 0:
        user.total_earnings += transaction.amount
    
    db.commit()
    
    # Log activity
    log_activity(
        db, transaction.user_id, "manual_transaction_created",
        entity_type="transaction",
        entity_id=new_transaction.id,
        details={"admin_id": admin.id, "amount": transaction.amount}
    )
    
    return {"message": "Transaction created successfully", "transaction_id": new_transaction.id}

@router.post("/transactions/{transaction_id}/refund")
def admin_refund_transaction(
    transaction_id: int,
    refund_request: RefundRequest,
    admin: User = Depends(require_permission("transactions:refund")),
    db: Session = Depends(get_db)
):
    """Admin: Refund a transaction"""
    success = refund_transaction(db, transaction_id, refund_request.reason)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot refund transaction")
    
    return {"message": "Transaction refunded successfully"}

@router.post("/transactions/{transaction_id}/fail")
def admin_fail_transaction(
    transaction_id: int,
    reason: str,
    admin: User = Depends(require_permission("transactions:approve")),
    db: Session = Depends(get_db)
):
    """Admin: Mark transaction as failed"""
    success = fail_transaction(db, transaction_id, reason)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot fail transaction")
    
    return {"message": "Transaction marked as failed"}

@router.get("/payouts", response_model=List[PayoutResponse])
def admin_get_all_payouts(
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_permission("payouts:list")),
    db: Session = Depends(get_db)
):
    """Admin: Get all payout requests"""
    query = db.query(Payout)
    
    if user_id:
        query = query.filter(Payout.user_id == user_id)
    
    if status:
        query = query.filter(Payout.status == status)
    
    payouts = query.order_by(Payout.requested_at.desc()).offset(skip).limit(limit).all()
    
    return payouts

@router.post("/payouts/{payout_id}/approve")
def admin_approve_payout(
    payout_id: int,
    admin: User = Depends(require_permission("payouts:approve")),
    db: Session = Depends(get_db)
):
    """Admin: Approve a payout request"""
    success = approve_payout(db, payout_id, admin.id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot approve payout")
    
    return {"message": "Payout approved successfully"}

@router.post("/payouts/{payout_id}/complete")
def admin_complete_payout(
    payout_id: int,
    completion: PayoutApproval,
    admin: User = Depends(require_permission("payouts:process")),
    db: Session = Depends(get_db)
):
    """Admin: Mark payout as completed"""
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    
    user = db.query(User).filter(User.id == payout.user_id).first()
    
    success = complete_payout(
        db,
        payout_id,
        completion.external_transaction_id,
        completion.external_response
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot complete payout")
    
    # Send payout processed email
    if user:
        asyncio.create_task(send_payout_processed_email(
            user.email,
            "approved",
            float(payout.amount),
            payout.payout_method,
            completion.external_transaction_id or payout.payout_reference,
            "1-3 business days",
            db
        ))
    
    return {"message": "Payout completed successfully"}

@router.post("/payouts/{payout_id}/reject")
def admin_reject_payout(
    payout_id: int,
    rejection: PayoutRejection,
    admin: User = Depends(require_permission("payouts:reject")),
    db: Session = Depends(get_db)
):
    """Admin: Reject a payout request"""
    success = reject_payout(db, payout_id, admin.id, rejection.reason)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot reject payout")
    
    return {"message": "Payout rejected successfully"}

@router.get("/verifications")
def admin_get_verifications(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_permission("verification:list")),
    db: Session = Depends(get_db)
):
    """Admin: Get all KYC verifications"""
    query = db.query(UserVerification)
    
    if status:
        query = query.filter(UserVerification.status == status)
    
    verifications = query.order_by(UserVerification.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add user info to each verification
    result = []
    for v in verifications:
        user = db.query(User).filter(User.id == v.user_id).first()
        verification_dict = {
            "id": v.id,
            "user_id": v.user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": user.full_name if user else "Unknown",
            "full_name": v.full_name,
            "document_type": v.document_type,
            "document_number": v.document_number,
            "document_file_path": v.document_file_path,
            "status": v.status.value,
            "created_at": v.created_at,
            "rejection_reason": v.rejection_reason
        }
        result.append(verification_dict)
    
    return result

@router.post("/verifications/{verification_id}/approve")
async def admin_approve_verification(
    verification_id: int,
    admin: User = Depends(require_permission("verification:approve")),
    db: Session = Depends(get_db)
):
    """Admin: Approve KYC verification"""
    verification = db.query(UserVerification).filter(UserVerification.id == verification_id).first()
    
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    if verification.status != VerificationStatus.pending:
        raise HTTPException(status_code=400, detail="Verification already processed")
    
    verification.status = VerificationStatus.approved
    verification.reviewed_at = datetime.utcnow()
    verification.reviewed_by = admin.id
    
    # Update user KYC status
    user = db.query(User).filter(User.id == verification.user_id).first()
    if user:
        user.kyc_verified = True
        user.kyc_verified_at = datetime.utcnow()
    
    db.commit()
    
    log_activity(
        db, verification.user_id, "kyc_approved",
        details={"admin_id": admin.id}
    )
    
    # Send approval email
    if user:
        from app.services.email_service import send_kyc_approved_email
        await send_kyc_approved_email(user.email, user.full_name or "User", db)
    
    return {"message": "Verification approved successfully"}

@router.post("/verifications/{verification_id}/reject")
async def admin_reject_verification(
    verification_id: int,
    reason: str,
    admin: User = Depends(require_permission("verification:reject")),
    db: Session = Depends(get_db)
):
    """Admin: Reject KYC verification"""
    verification = db.query(UserVerification).filter(UserVerification.id == verification_id).first()
    
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    if verification.status != VerificationStatus.pending:
        raise HTTPException(status_code=400, detail="Verification already processed")
    
    verification.status = VerificationStatus.rejected
    verification.rejection_reason = reason
    verification.reviewed_at = datetime.utcnow()
    verification.reviewed_by = admin.id
    
    db.commit()
    
    log_activity(
        db, verification.user_id, "kyc_rejected",
        details={"admin_id": admin.id, "reason": reason}
    )
    
    # Send rejection email
    user = db.query(User).filter(User.id == verification.user_id).first()
    if user:
        from app.services.email_service import send_kyc_rejected_email
        await send_kyc_rejected_email(user.email, user.full_name or "User", reason, db)
    
    return {"message": "Verification rejected successfully"}
