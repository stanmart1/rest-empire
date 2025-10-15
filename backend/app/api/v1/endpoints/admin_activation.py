from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.activation import ActivationPackage
from app.schemas.activation import (
    ActivationPackageResponse, 
    ActivationPackageCreate, 
    ActivationPackageUpdate
)
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
        features=package_data.features or [],
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
    
    if package_data.features is not None:
        package.features = package_data.features
    
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
    """Delete activation package (admin only)"""
    package = db.query(ActivationPackage).filter(
        ActivationPackage.id == package_id
    ).first()
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    db.delete(package)
    db.commit()
    
    return {"message": "Package deleted successfully"}
