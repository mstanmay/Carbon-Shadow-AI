from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.api.deps import get_current_user
from app.models.base import User, UserPreferences, CarbonScore, AuditLog
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    UserPreferencesResponse, UserPreferencesUpdate, RefreshTokenRequest
)
from app.core.limiter import limiter

router = APIRouter()

def log_event(db: Session, user_id: int, action: str, request: Request):
    # Grab client IP
    ip = request.client.host if request.client else "unknown"
    log = AuditLog(user_id=user_id, action=action, ip_address=ip)
    db.add(log)
    db.commit()

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account, initialize their default preferences, initialize their Carbon Score to 100, and log the registration event.",
    response_description="The created user object.",
    responses={
        400: {"description": "Email is already registered or password does not meet requirements."},
        422: {"description": "Validation error for user details payload."}
    }
)
@limiter.limit("10/minute")
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

@router.post(
    "/login",
    response_model=Token,
    summary="User login authentication",
    description="Authenticate user credentials and return a pair of access and refresh tokens. Logs login success event.",
    response_description="A pair of access and refresh tokens.",
    responses={
        400: {"description": "Incorrect email or password."},
        422: {"description": "Validation error for input payload."}
    }
)
@limiter.limit("10/minute")
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

@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="Validate refresh token and issue a fresh pair of access and refresh tokens.",
    response_description="A fresh pair of access and refresh tokens.",
    responses={
        400: {"description": "Missing refresh token."},
        401: {"description": "Invalid refresh token or user not found."},
        422: {"description": "Validation error for input payload."}
    }
)
@limiter.limit("10/minute")
def refresh(token_in: RefreshTokenRequest, request: Request, db: Session = Depends(get_db)):
    refresh_token = token_in.refresh_token
    
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

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user details",
    description="Retrieve the profile details of the currently authenticated user.",
    response_description="The user details.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."}
    }
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get(
    "/me/preferences",
    response_model=UserPreferencesResponse,
    summary="Get user preferences",
    description="Retrieve the sustainability and theme preferences of the currently authenticated user.",
    response_description="The user preferences details.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."}
    }
)
def get_preferences(current_user: User = Depends(get_current_user)):
    return current_user.preferences

@router.put(
    "/me/preferences",
    response_model=UserPreferencesResponse,
    summary="Update user preferences",
    description="Update the theme, currency, commute mode, or diet type preferences for the currently authenticated user.",
    response_description="The updated user preferences.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        422: {"description": "Validation error for user preference update input."}
    }
)
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

