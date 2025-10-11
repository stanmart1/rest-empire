from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.promo_material import MaterialType

class PromoMaterialResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    material_type: MaterialType
    file_url: str
    file_size: Optional[int]
    language: str
    download_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PromoMaterialStats(BaseModel):
    total_materials: int
    total_downloads: int
    materials_by_type: dict
