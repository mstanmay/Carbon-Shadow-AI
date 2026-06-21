from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, Achievement
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class AchievementClaim(BaseModel):
    badge_type: str
    title: str
    description: Optional[str] = None
    rarity: str = "Common"

class AchievementResponse(BaseModel):
    id: int
    badge_type: str
    title: str
    description: Optional[str]
    rarity: str
    is_minted: bool
    earned_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=list[AchievementResponse])
def list_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Achievement).filter(Achievement.user_id == current_user.id).all()

@router.post("/claim", response_model=AchievementResponse)
def claim_achievement(claim_in: AchievementClaim, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Achievement).filter(
        Achievement.user_id == current_user.id,
        Achievement.badge_type == claim_in.badge_type
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Achievement already claimed")

    achievement = Achievement(
        user_id=current_user.id,
        badge_type=claim_in.badge_type,
        title=claim_in.title,
        description=claim_in.description,
        rarity=claim_in.rarity,
    )
    db.add(achievement)
    db.commit()
    db.refresh(achievement)
    return achievement

@router.post("/mint/{achievement_id}")
def mint_achievement(achievement_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    achievement = db.query(Achievement).filter(
        Achievement.id == achievement_id,
        Achievement.user_id == current_user.id
    ).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    if achievement.is_minted:
        raise HTTPException(status_code=400, detail="Already minted")

    achievement.is_minted = True
    db.commit()
    return {"minted": True, "badge_type": achievement.badge_type, "tx_hash": f"0x{'mock' * 16}"}
