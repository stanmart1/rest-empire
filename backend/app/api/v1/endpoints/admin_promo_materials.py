from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.models.promo_material import PromoMaterial, MaterialType

router = APIRouter()

class PromoMaterialCreate(BaseModel):
    title: str
    description: str
    material_type: str
    file_url: str
    language: str = "en"

@router.post("/promo-materials")
def create_promo_material(
    data: PromoMaterialCreate,
    admin: User = Depends(require_permission("content:write")),
    db: Session = Depends(get_db)
):
    """Create promotional material (admin only)"""
    material = PromoMaterial(
        title=data.title,
        description=data.description,
        material_type=MaterialType[data.material_type],
        file_url=data.file_url,
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
    admin: User = Depends(require_permission("content:write")),
    db: Session = Depends(get_db)
):
    """Update promotional material (admin only)"""
    material = db.query(PromoMaterial).filter(PromoMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    material.title = data.title
    material.description = data.description
    material.material_type = MaterialType[data.material_type]
    material.file_url = data.file_url
    material.language = data.language
    
    db.commit()
    db.refresh(material)
    return material

@router.delete("/promo-materials/{material_id}")
def delete_promo_material(
    material_id: int,
    admin: User = Depends(require_permission("content:write")),
    db: Session = Depends(get_db)
):
    """Delete promotional material (admin only)"""
    material = db.query(PromoMaterial).filter(PromoMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
