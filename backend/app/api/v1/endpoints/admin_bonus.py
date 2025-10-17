from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.services.config_service import get_config, set_config
from app.utils.activity import log_activity
import json

router = APIRouter()

@router.get("/bonus-settings")
def get_bonus_settings(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get bonus settings"""
    return {
        "unilevel": {
            "enabled": get_config(db, "unilevel_enabled", "false") == "true",
            "percentages": json.loads(get_config(db, "unilevel_percentages", "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"))
        },
        "rank_bonus": {
            "enabled": get_config(db, "rank_bonus_enabled", "false") == "true",
            "amounts": json.loads(get_config(db, "rank_bonus_amounts", "{}"))
        },
        "infinity_bonus": {
            "enabled": get_config(db, "infinity_bonus_enabled", "false") == "true",
            "percentage": float(get_config(db, "infinity_bonus_percentage", "0"))
        }
    }

@router.put("/bonus-settings")
def update_bonus_settings(
    settings: Dict,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update bonus settings"""
    if "unilevel" in settings:
        set_config(db, "unilevel_enabled", str(settings["unilevel"].get("enabled", False)).lower())
        set_config(db, "unilevel_percentages", json.dumps(settings["unilevel"].get("percentages", [])))
    
    if "rank_bonus" in settings:
        set_config(db, "rank_bonus_enabled", str(settings["rank_bonus"].get("enabled", False)).lower())
        set_config(db, "rank_bonus_amounts", json.dumps(settings["rank_bonus"].get("amounts", {})))
    
    if "infinity_bonus" in settings:
        set_config(db, "infinity_bonus_enabled", str(settings["infinity_bonus"].get("enabled", False)).lower())
        set_config(db, "infinity_bonus_percentage", str(settings["infinity_bonus"].get("percentage", 0)))
    
    log_activity(db, admin.id, "bonus_settings_updated", details=settings)
    return {"message": "Bonus settings updated successfully"}
