from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user
from app.models.base import User, UserPreferences, CarbonScore, AuditLog
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, UserPreferencesResponse, UserPreferencesUpdate

router = APIRouter()

def log_event(db: Session, user_id: int, action: str, request: Request):
    # Grab client IP
    ip = request.client.host if request.client else "unknown"
    log = AuditLog(user_id=user_id, action=action, ip_address=ip)
    db.add(log)
    db.commit()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Create user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(email=user_in.email, hashed_password=hashed_pwd)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize preferences
    prefs = UserPreferences(user_id=user.id)
    db.add(prefs)

    # Initialize Carbon Score
    score = CarbonScore(user_id=user.id, score=100, risk_index="Low")
    db.add(score)

    db.commit()

    # Log action
    log_event(db, user.id, "USER_REGISTERED", request)

    return user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    # Generate tokens
    access_token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)

    log_event(db, user.id, "USER_LOGIN_SUCCESS", request)

    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
def refresh(token_in: dict, db: Session = Depends(get_db)):
    refresh_token = token_in.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh token")
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    new_access = create_access_token(user.email)
    new_refresh = create_refresh_token(user.email)
    return Token(access_token=new_access, refresh_token=new_refresh)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/preferences", response_model=UserPreferencesResponse)
def get_preferences(current_user: User = Depends(get_current_user)):
    return current_user.preferences

@router.put("/me/preferences", response_model=UserPreferencesResponse)
def update_preferences(
    prefs_in: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prefs = current_user.preferences
    if prefs_in.theme is not None:
        prefs.theme = prefs_in.theme
    if prefs_in.currency is not None:
        prefs.currency = prefs_in.currency
    if prefs_in.commute_mode is not None:
        prefs.commute_mode = prefs_in.commute_mode
    if prefs_in.diet_type is not None:
        prefs.diet_type = prefs_in.diet_type
    
    db.commit()
    db.refresh(prefs)
    return prefs
