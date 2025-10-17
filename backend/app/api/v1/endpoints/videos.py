from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.video import Video

router = APIRouter()

@router.get("/")
def get_public_videos(db: Session = Depends(get_db)):
    """Public: Get all videos"""
    videos = db.query(Video).order_by(Video.created_at.desc()).all()
    return videos
