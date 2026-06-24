from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, Achievement
from app.schemas.schemas import AchievementClaim, AchievementResponse

router = APIRouter()

@router.get(
    "/",
    response_model=list[AchievementResponse],
    summary="List earned achievements",
    description="Retrieve all eco achievement badges earned by the currently authenticated user.",
    response_description="A list of achievements earned by the user.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."}
    }
)
def list_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Achievement).filter(Achievement.user_id == current_user.id).all()

@router.post(
    "/claim",
    response_model=AchievementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Claim a new achievement",
    description="Claim a specific sustainability achievement badge if the user has not claimed it yet.",
    response_description="The claimed achievement badge.",
    responses={
        400: {"description": "Achievement has already been claimed by the user."},
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        422: {"description": "Validation error for input parameters."}
    }
)
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

@router.post(
    "/mint/{achievement_id}",
    summary="Mint achievement to blockchain",
    description="Mint an earned achievement badge as a verifiable eco-identity credentials on the mock blockchain.",
    response_description="Confirmation of minting with the transaction hash.",
    responses={
        400: {"description": "Achievement is already minted."},
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        404: {"description": "Achievement not found for this user."},
        422: {"description": "Validation error for input parameters."}
    }
)
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

