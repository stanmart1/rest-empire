from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.activation import UserActivation, ActivationPackage
from app.schemas.activation import (
    UserActivationResponse, ActivationPackageResponse, ActivationRequest
)

router = APIRouter()

@router.get("/packages", response_model=List[ActivationPackageResponse])
def get_activation_packages(db: Session = Depends(get_db)):
    """Get available activation packages"""
    packages = db.query(ActivationPackage).filter(
        ActivationPackage.is_active == True
    ).order_by(ActivationPackage.sort_order).all()
    return packages

@router.get("/status", response_model=UserActivationResponse)
def get_activation_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's activation status"""
    activation = db.query(UserActivation).filter(
        UserActivation.user_id == current_user.id
    ).first()
    
    if not activation:
        # Create default inactive activation record
        activation = UserActivation(
            user_id=current_user.id,
            status="inactive"
        )
        db.add(activation)
        db.commit()
        db.refresh(activation)
    
    return activation

@router.post("/request", response_model=dict)
def request_activation(
    request: ActivationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request account activation with payment"""
    # Check if user already has active activation
    existing = db.query(UserActivation).filter(
        UserActivation.user_id == current_user.id
    ).first()
    
    if existing and existing.status == "active":
        raise HTTPException(
            status_code=400, 
            detail="Account is already activated"
        )
    
    # Get package info
    package = db.query(ActivationPackage).filter(
        ActivationPackage.id == request.package_id,
        ActivationPackage.is_active.is_(True)
    ).first()
    
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    # Create or update activation record
    if existing:
        existing.package_id = request.package_id
        existing.activation_fee = package.price
        existing.status = "pending_payment"
        activation = existing
    else:
        activation = UserActivation(
            user_id=current_user.id,
            package_id=request.package_id,
            activation_fee=package.price,
            status="pending_payment"
        )
        db.add(activation)
    
    db.commit()
    db.refresh(activation)
    
    return {
        "message": "Activation request created. Please complete payment to activate your account.",
        "package": package.name,
        "amount": package.price,
        "currency": package.currency
    }

@router.post("/link-transaction/{transaction_id}")
def link_transaction_to_activation(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link payment transaction to activation record"""
    from app.models.transaction import Transaction
    
    # Verify transaction belongs to user
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get user's activation record
    activation = db.query(UserActivation).filter(
        UserActivation.user_id == current_user.id
    ).first()
    
    if not activation:
        raise HTTPException(status_code=404, detail="Activation record not found")
    
    # Link transaction to activation
    activation.payment_transaction_id = transaction_id
    db.commit()
    
    return {"message": "Transaction linked successfully"}
