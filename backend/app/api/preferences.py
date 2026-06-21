from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, UserTheme, UserLanguage
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ThemeUpdate(BaseModel):
    theme_name: str

class LanguageUpdate(BaseModel):
    language_code: str
    auto_detected: bool = False

@router.get("/theme")
def get_theme(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    theme = db.query(UserTheme).filter(UserTheme.user_id == current_user.id).first()
    if not theme:
        return {"theme_name": "dark-sustainability"}
    return {"theme_name": theme.theme_name}

@router.put("/theme")
def set_theme(theme_in: ThemeUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    theme = db.query(UserTheme).filter(UserTheme.user_id == current_user.id).first()
    if not theme:
        theme = UserTheme(user_id=current_user.id, theme_name=theme_in.theme_name)
        db.add(theme)
    else:
        theme.theme_name = theme_in.theme_name
    db.commit()
    return {"theme_name": theme.theme_name}

@router.get("/language")
def get_language(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lang = db.query(UserLanguage).filter(UserLanguage.user_id == current_user.id).first()
    if not lang:
        return {"language_code": "en", "auto_detected": True}
    return {"language_code": lang.language_code, "auto_detected": lang.auto_detected}

@router.put("/language")
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
