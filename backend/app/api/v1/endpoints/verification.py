from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.verification import UserVerification, VerificationStatus
from app.utils.activity import log_activity
from app.core.storage import save_file, get_file_url
import os

router = APIRouter()

@router.post("/submit")
async def submit_verification(
    full_name: str = Form(...),
    gender: str = Form(...),
    date_of_birth: str = Form(...),
    place_of_birth: str = Form(...),
    nationality: str = Form(...),
    document_type: str = Form(...),
    document_number: str = Form(...),
    document_issue_date: str = Form(None),
    document_expiry_date: str = Form(None),
    document_file: UploadFile = File(...),
    address_country: str = Form(...),
    address_city: str = Form(...),
    address_street: str = Form(...),
    address_zip: str = Form(...),
    business_name: str = Form(None),
    business_type: str = Form(None),
    business_reg_number: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save document file
    file_extension = os.path.splitext(document_file.filename)[1]
    file_name = f"{current_user.id}_{datetime.utcnow().timestamp()}{file_extension}"
    file_data = await document_file.read()
    file_path = save_file(file_data, file_name, "verifications")
    
    # Create verification record
    verification = UserVerification(
        user_id=current_user.id,
        full_name=full_name,
        gender=gender,
        date_of_birth=datetime.fromisoformat(date_of_birth) if date_of_birth else None,
        place_of_birth=place_of_birth,
        nationality=nationality,
        document_type=document_type,
        document_number=document_number,
        document_issue_date=datetime.fromisoformat(document_issue_date) if document_issue_date else None,
        document_expiry_date=datetime.fromisoformat(document_expiry_date) if document_expiry_date else None,
        document_file_path=str(file_path),
        address_country=address_country,
        address_city=address_city,
        address_street=address_street,
        address_zip=address_zip,
        business_name=business_name,
        business_type=business_type,
        business_reg_number=business_reg_number,
        status=VerificationStatus.pending
    )
    
    db.add(verification)
    db.commit()
    db.refresh(verification)
    
    log_activity(db, current_user.id, "verification_submitted")
    
    return {"message": "Verification submitted successfully", "verification_id": verification.id}

@router.get("/status")
def get_verification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verification = db.query(UserVerification).filter(
        UserVerification.user_id == current_user.id
    ).order_by(UserVerification.created_at.desc()).first()
    
    if not verification:
        return {"status": "not_submitted"}
    
    return {
        "status": verification.status.value,
        "created_at": verification.created_at,
        "rejection_reason": verification.rejection_reason
    }
