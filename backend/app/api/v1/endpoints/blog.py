from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.models.blog import Blog
from app.schemas.blog import BlogResponse, BlogCreate, BlogUpdate

router = APIRouter()

@router.get("/", response_model=List[BlogResponse])
def get_blogs(db: Session = Depends(deps.get_db)):
    return db.query(Blog).order_by(Blog.created_at.desc()).all()

@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog(blog_id: int, db: Session = Depends(deps.get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.post("/", response_model=BlogResponse)
def create_blog(
    blog: BlogCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_blog = Blog(**blog.dict())
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(
    blog_id: int,
    blog: BlogUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not db_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    for key, value in blog.dict().items():
        setattr(db_blog, key, value)
    
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.delete("/{blog_id}")
def delete_blog(
    blog_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.core.rbac import has_role
    if not has_role(db, current_user, "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not db_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db.delete(db_blog)
    db.commit()
    return {"message": "Blog deleted"}
