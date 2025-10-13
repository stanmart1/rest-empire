from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.promo_material import PromoMaterial, MaterialType
from app.schemas.promo_material import PromoMaterialResponse

router = APIRouter()

@router.get("/", response_model=List[PromoMaterialResponse])
def get_promo_materials(
    material_type: Optional[MaterialType] = None,
    language: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get promotional materials"""
    query = db.query(PromoMaterial).filter(PromoMaterial.is_active == True)
    
    if material_type:
        query = query.filter(PromoMaterial.material_type == material_type)
    
    if language:
        query = query.filter(PromoMaterial.language == language)
    
    materials = query.order_by(PromoMaterial.created_at.desc()).offset(skip).limit(limit).all()
    return materials

@router.post("/{material_id}/download")
def download_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track material download"""
    material = db.query(PromoMaterial).filter(
        PromoMaterial.id == material_id,
        PromoMaterial.is_active == True
    ).first()
    
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Increment download count
    material.download_count += 1
    db.commit()
    
    return {
        "message": "Download tracked successfully",
        "download_url": material.file_url
    }
