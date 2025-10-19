from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict
from app.core.database import get_db
from app.api.deps import require_permission
from app.models.user import User
from app.services.config_service import get_config, set_config
from app.utils.activity import log_activity
import json

router = APIRouter()

@router.get("/bonus-settings")
def get_bonus_settings(
    admin: User = Depends(require_permission("bonuses:config")),
    db: Session = Depends(get_db)
):
    """Admin: Get bonus settings"""
    unilevel_enabled = get_config(db, "unilevel_enabled")
    unilevel_percentages = get_config(db, "unilevel_percentages")
    rank_bonus_enabled = get_config(db, "rank_bonus_enabled")
    rank_bonus_amounts = get_config(db, "rank_bonus_amounts")
    infinity_enabled = get_config(db, "infinity_bonus_enabled")
    infinity_percentage = get_config(db, "infinity_bonus_percentage")
    
    return {
        "unilevel": {
            "enabled": unilevel_enabled == "true" if unilevel_enabled else False,
            "percentages": json.loads(unilevel_percentages) if unilevel_percentages else [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        },
        "rank_bonus": {
            "enabled": rank_bonus_enabled == "true" if rank_bonus_enabled else False,
            "amounts": json.loads(rank_bonus_amounts) if rank_bonus_amounts else {}
        },
        "infinity_bonus": {
            "enabled": infinity_enabled == "true" if infinity_enabled else False,
            "percentage": float(infinity_percentage) if infinity_percentage else 0
        }
    }

@router.put("/bonus-settings")
def update_bonus_settings(
    settings: Dict,
    admin: User = Depends(require_permission("bonuses:config")),
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
