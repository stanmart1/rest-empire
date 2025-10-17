from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.video import Video
from app.utils.activity import log_activity
import os
import shutil
from pathlib import Path
from datetime import datetime

router = APIRouter()

class VideoCreate(BaseModel):
    title: str
    description: str
    video_url: str
    thumbnail_url: str = None

class VideoUpdate(BaseModel):
    title: str = None
    description: str = None
    video_url: str = None
    thumbnail_url: str = None

@router.get("/")
def get_videos(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all videos"""
    videos = db.query(Video).order_by(Video.created_at.desc()).all()
    return videos

@router.post("/")
def create_video(
    video: VideoCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Create new video"""
    new_video = Video(**video.dict())
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    log_activity(db, admin.id, "video_created", entity_type="video", entity_id=new_video.id)
    
    return new_video

@router.put("/{video_id}")
def update_video(
    video_id: int,
    video: VideoUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update video"""
    db_video = db.query(Video).filter(Video.id == video_id).first()
    
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    for key, value in video.dict(exclude_unset=True).items():
        setattr(db_video, key, value)
    
    db.commit()
    db.refresh(db_video)
    
    log_activity(db, admin.id, "video_updated", entity_type="video", entity_id=video_id)
    
    return db_video

@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete video"""
    db_video = db.query(Video).filter(Video.id == video_id).first()
    
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    db.delete(db_video)
    db.commit()
    
    log_activity(db, admin.id, "video_deleted", entity_type="video", entity_id=video_id)
    
    return {"message": "Video deleted successfully"}

@router.post("/upload-thumbnail")
async def upload_thumbnail(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user)
):
    """Admin: Upload video thumbnail"""
    UPLOAD_DIR = Path("uploads/thumbnails")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{datetime.utcnow().timestamp()}{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"url": f"/uploads/thumbnails/{file_name}"}
