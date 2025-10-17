from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.activation import ActivationPackage, UserActivation
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.activation import (
    ActivationPackageResponse, 
    ActivationPackageCreate, 
    ActivationPackageUpdate
)
from app.services.transaction_service import complete_purchase_transaction, fail_transaction
from app.services.email_service import send_account_activated_email, send_payment_received_email
from slugify import slugify

router = APIRouter()

@router.get("/", response_model=List[ActivationPackageResponse])
def get_all_packages(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all activation packages (admin only)"""
    packages = db.query(ActivationPackage).order_by(
        ActivationPackage.sort_order
    ).all()
    return packages

@router.post("/", response_model=ActivationPackageResponse)
def create_package(
    package_data: ActivationPackageCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create new activation package (admin only)"""
    # Generate slug from name
    slug = slugify(package_data.name)
    
    # Check if slug already exists
    existing = db.query(ActivationPackage).filter(
        ActivationPackage.slug == slug
    ).first()
    
    if existing:
        # Append number to make unique
        counter = 1
        while db.query(ActivationPackage).filter(
            ActivationPackage.slug == f"{slug}-{counter}"
        ).first():
            counter += 1
        slug = f"{slug}-{counter}"
    
    # Get max sort order
    max_order = db.query(ActivationPackage).count()
    
    package = ActivationPackage(
        name=package_data.name,
        slug=slug,
        description=package_data.description,
        price=package_data.price,
        currency="NGN",
        duration_days=package_data.duration_days,
        features=package_data.features or [],
        allowed_features=package_data.allowed_features,
        is_active=package_data.is_active,
        sort_order=max_order + 1
    )
    
    db.add(package)
    db.commit()
    db.refresh(package)
    
    return package

@router.put("/{package_id}", response_model=ActivationPackageResponse)
def update_package(
    package_id: int,
    package_data: ActivationPackageUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update activation package (admin only)"""
    package = db.query(ActivationPackage).filter(
        ActivationPackage.id == package_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Update fields
    if package_data.name is not None:
        package.name = package_data.name
        package.slug = slugify(package_data.name)
    
    if package_data.description is not None:
        package.description = package_data.description
    
    if package_data.price is not None:
        package.price = package_data.price
    
    if package_data.duration_days is not None:
        package.duration_days = package_data.duration_days
    
    if package_data.features is not None:
        package.features = package_data.features
    
    if package_data.allowed_features is not None:
        package.allowed_features = package_data.allowed_features
    
    if package_data.is_active is not None:
        package.is_active = package_data.is_active
    
    db.commit()
    db.refresh(package)
    
    return package

@router.delete("/{package_id}")
def delete_package(
    package_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete activation package and related records (admin only)"""
    package = db.query(ActivationPackage).filter(
        ActivationPackage.id == package_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Get all activations using this package
    activations = db.query(UserActivation).filter(
        UserActivation.package_id == package_id
    ).all()
    
    # Delete related transactions and deactivate users
    for activation in activations:
        if activation.payment_transaction_id:
            # Delete the transaction
            transaction = db.query(Transaction).filter(
                Transaction.id == activation.payment_transaction_id
            ).first()
            if transaction:
                db.delete(transaction)
        
        # Deactivate the user
        user = db.query(User).filter(User.id == activation.user_id).first()
        if user:
            user.is_active = False
            user.deactivated_at = datetime.utcnow()
        
        # Delete the activation record
        db.delete(activation)
    
    # Delete the package
    db.delete(package)
    db.commit()
    
    return {"message": "Package and related records deleted successfully"}

@router.get("/payments")
def get_activation_payments(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all activation payments"""
    payments = db.query(
        Transaction.id,
        Transaction.amount,
        Transaction.currency,
        Transaction.status,
        Transaction.payment_method,
        Transaction.payment_reference,
        Transaction.meta_data,
        Transaction.created_at,
        User.id.label('user_id'),
        User.full_name.label('user_name'),
        User.email.label('user_email'),
        ActivationPackage.name.label('package_name')
    ).join(
        User, Transaction.user_id == User.id
    ).join(
        UserActivation, UserActivation.payment_transaction_id == Transaction.id
    ).join(
        ActivationPackage, UserActivation.package_id == ActivationPackage.id
    ).filter(
        Transaction.transaction_type == TransactionType.purchase
    ).order_by(Transaction.created_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "amount": float(p.amount),
            "currency": p.currency,
            "status": p.status.value,
            "payment_method": p.payment_method,
            "payment_reference": p.payment_reference,
            "meta_data": p.meta_data,
            "created_at": p.created_at,
            "user_id": p.user_id,
            "user_name": p.user_name,
            "user_email": p.user_email,
            "package_name": p.package_name
        }
        for p in payments
    ]

@router.post("/payments/{transaction_id}/approve")
def approve_activation_payment(
    transaction_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Approve activation payment and activate user account"""
    from datetime import timedelta
    
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.status != TransactionStatus.pending:
        raise HTTPException(status_code=400, detail="Transaction already processed")
    
    complete_purchase_transaction(db, transaction_id)
    
    activation = db.query(UserActivation).filter(
        UserActivation.payment_transaction_id == transaction_id
    ).first()
    
    if activation:
        activation.status = "active"
        activation.activated_at = datetime.utcnow()
        
        # Calculate expiration date based on package duration
        package = db.query(ActivationPackage).filter(
            ActivationPackage.id == activation.package_id
        ).first()
        
        if package and package.duration_days:
            activation.expires_at = activation.activated_at + timedelta(days=package.duration_days)
        
        user = db.query(User).filter(User.id == activation.user_id).first()
        if user:
            user.is_active = True
            user.deactivated_at = None
            
            # Send account activated email
            import asyncio
            asyncio.create_task(send_account_activated_email(
                user.email,
                user.full_name or "User",
                package.name,
                float(package.price),
                db
            ))
        
        db.commit()
    
    return {"message": "Payment approved and account activated"}

@router.post("/payments/{transaction_id}/reject")
def reject_activation_payment(
    transaction_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Reject activation payment"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.status != TransactionStatus.pending:
        raise HTTPException(status_code=400, detail="Transaction already processed")
    
    fail_transaction(db, transaction_id, "Payment rejected by admin")
    
    activation = db.query(UserActivation).filter(
        UserActivation.payment_transaction_id == transaction_id
    ).first()
    
    if activation:
        activation.status = "inactive"
        db.commit()
    
    return {"message": "Payment rejected"}

@router.post("/packages/{package_id}/assign")
def assign_package_to_users(
    package_id: int,
    user_ids: list[int],
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Assign activation package to users"""
    from datetime import timedelta
    
    package = db.query(ActivationPackage).filter(ActivationPackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    activated_users = []
    
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            continue
        
        # Get or create activation record
        activation = db.query(UserActivation).filter(
            UserActivation.user_id == user_id
        ).first()
        
        if not activation:
            activation = UserActivation(user_id=user_id)
            db.add(activation)
        
        # Update activation
        activation.package_id = package_id
        activation.activation_fee = package.price
        activation.status = "active"
        activation.activated_at = datetime.utcnow()
        activation.expires_at = datetime.utcnow() + timedelta(days=package.duration_days)
        
        # Activate user account
        user.is_active = True
        user.deactivated_at = None
        
        # Send account activated email
        import asyncio
        asyncio.create_task(send_account_activated_email(
            user.email,
            user.full_name or "User",
            package.name,
            float(package.price),
            db
        ))
        
        activated_users.append(user.email)
    
    db.commit()
    
    return {
        "message": f"Package assigned to {len(activated_users)} user(s)",
        "activated_users": activated_users
    }
