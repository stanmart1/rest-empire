from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from pathlib import Path
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.promo_material import PromoMaterial, MaterialType
from app.core.storage import UPLOAD_DIR

router = APIRouter()

@router.get("/promo-materials")
def get_all_promo_materials(
    admin: User = Depends(require_permission("promo_materials:list")),
    db: Session = Depends(get_db)
):
    """Get all promotional materials (admin only)"""
    materials = db.query(PromoMaterial).order_by(PromoMaterial.created_at.desc()).all()
    return materials

class PromoMaterialCreate(BaseModel):
    title: str
    description: str
    material_type: str
    file_url: str
    language: str = "en"

@router.post("/promo-materials")
def create_promo_material(
    data: PromoMaterialCreate,
    admin: User = Depends(require_permission("promo_materials:create")),
    db: Session = Depends(get_db)
):
    """Create promotional material (admin only)"""
    # Calculate file size
    file_size = None
    if data.file_url.startswith('/uploads/'):
        file_path = UPLOAD_DIR / data.file_url.replace('/uploads/', '')
        if file_path.exists():
            file_size = file_path.stat().st_size
    
    material = PromoMaterial(
        title=data.title,
        description=data.description,
        material_type=MaterialType[data.material_type],
        file_url=data.file_url,
        file_size=file_size,
        language=data.language,
        is_active=True
    )
    
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

@router.put("/promo-materials/{material_id}")
def update_promo_material(
    material_id: int,
    data: PromoMaterialCreate,
    admin: User = Depends(require_permission("promo_materials:create")),
    db: Session = Depends(get_db)
):
    """Update promotional material (admin only)"""
    material = db.query(PromoMaterial).filter(PromoMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Calculate file size
    file_size = None
    if data.file_url.startswith('/uploads/'):
        file_path = UPLOAD_DIR / data.file_url.replace('/uploads/', '')
        if file_path.exists():
            file_size = file_path.stat().st_size
    
    material.title = data.title
    material.description = data.description
    material.material_type = MaterialType[data.material_type]
    material.file_url = data.file_url
    material.file_size = file_size
    material.language = data.language
    
    db.commit()
    db.refresh(material)
    return material

@router.delete("/promo-materials/{material_id}")
def delete_promo_material(
    material_id: int,
    admin: User = Depends(require_permission("promo_materials:create")),
    db: Session = Depends(get_db)
):
    """Delete promotional material (admin only)"""
    material = db.query(PromoMaterial).filter(PromoMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
