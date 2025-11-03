from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.deps import require_permission, check_feature_access
from app.models.crypto_signal import CryptoSignal, SignalStatus
from app.schemas.crypto_signal import CryptoSignalCreate, CryptoSignalUpdate, CryptoSignalResponse

router = APIRouter()

@router.get("/signals", response_model=List[CryptoSignalResponse])
def get_signals(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("crypto_signals:list"))
):
    query = db.query(CryptoSignal)
    if status:
        query = query.filter(CryptoSignal.status == status)
    return query.order_by(CryptoSignal.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/signals", response_model=CryptoSignalResponse)
def create_signal(
    signal: CryptoSignalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("crypto_signals:create"))
):
    db_signal = CryptoSignal(**signal.dict())
    db.add(db_signal)
    db.commit()
    db.refresh(db_signal)
    return db_signal

@router.put("/signals/{signal_id}", response_model=CryptoSignalResponse)
def update_signal(
    signal_id: int,
    signal: CryptoSignalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("crypto_signals:update"))
):
    db_signal = db.query(CryptoSignal).filter(CryptoSignal.id == signal_id).first()
    if not db_signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    for key, value in signal.dict(exclude_unset=True).items():
        setattr(db_signal, key, value)
    
    if signal.status == "closed" and not db_signal.closed_at:
        db_signal.closed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_signal)
    return db_signal

@router.delete("/signals/{signal_id}")
def delete_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("crypto_signals:delete"))
):
    db_signal = db.query(CryptoSignal).filter(CryptoSignal.id == signal_id).first()
    if not db_signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    db.delete(db_signal)
    db.commit()
    return {"message": "Signal deleted"}

@router.get("/signals/published", response_model=List[CryptoSignalResponse])
def get_published_signals(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user = Depends(check_feature_access("crypto_signals"))
):
    return db.query(CryptoSignal).filter(
        CryptoSignal.is_published == True,
        CryptoSignal.status == SignalStatus.active
    ).order_by(CryptoSignal.created_at.desc()).offset(skip).limit(limit).all()
