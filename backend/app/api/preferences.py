from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, UserTheme, UserLanguage
from app.schemas.schemas import ThemeUpdate, LanguageUpdate

router = APIRouter()

@router.get(
    "/theme",
    summary="Get user UI theme",
    description="Retrieve the selected UI theme preference for the currently authenticated user.",
    response_description="The user's theme name.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."}
    }
)
def get_theme(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    theme = db.query(UserTheme).filter(UserTheme.user_id == current_user.id).first()
    if not theme:
        return {"theme_name": "dark-sustainability"}
    return {"theme_name": theme.theme_name}

@router.put(
    "/theme",
    summary="Set user UI theme",
    description="Update the UI theme preference for the currently authenticated user. Supported themes: dark-sustainability, light-sustainability, forest, solar, ocean.",
    response_description="The updated theme name.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        422: {"description": "Validation error for theme name parameter."}
    }
)
def set_theme(theme_in: ThemeUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    theme = db.query(UserTheme).filter(UserTheme.user_id == current_user.id).first()
    if not theme:
        theme = UserTheme(user_id=current_user.id, theme_name=theme_in.theme_name)
        db.add(theme)
    else:
        theme.theme_name = theme_in.theme_name
    db.commit()
    return {"theme_name": theme.theme_name}

@router.get(
    "/language",
    summary="Get user language setting",
    description="Retrieve the preferred language and detection flag for the currently authenticated user.",
    response_description="The language code and auto-detected status.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."}
    }
)
def get_language(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lang = db.query(UserLanguage).filter(UserLanguage.user_id == current_user.id).first()
    if not lang:
        return {"language_code": "en", "auto_detected": True}
    return {"language_code": lang.language_code, "auto_detected": lang.auto_detected}

@router.put(
    "/language",
    summary="Set user language setting",
    description="Update the preferred language code and auto-detection flag for the currently authenticated user. Supported languages: en, hi, kn, ta, te, ml, mr, bn, gu, pa, or, ur, as.",
    response_description="The updated language settings.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        422: {"description": "Validation error for language code parameter."}
    }
)
def set_language(lang_in: LanguageUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lang = db.query(UserLanguage).filter(UserLanguage.user_id == current_user.id).first()
    if not lang:
        lang = UserLanguage(user_id=current_user.id, language_code=lang_in.language_code, auto_detected=lang_in.auto_detected)
        db.add(lang)
    else:
        lang.language_code = lang_in.language_code
        lang.auto_detected = lang_in.auto_detected
    db.commit()
    return {"language_code": lang.language_code, "auto_detected": lang.auto_detected}

