from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- AUTH & USER SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None


# --- PREFERENCES SCHEMAS ---
class UserPreferencesResponse(BaseModel):
    theme: str
    currency: str
    commute_mode: str
    diet_type: str

    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    currency: Optional[str] = None
    commute_mode: Optional[str] = None
    diet_type: Optional[str] = None


# --- SIMULATION & RECOMMENDATION SCHEMAS ---
class RecommendationResponse(BaseModel):
    option_name: str
    co2_value: float
    reasoning: str
    savings_potential: float

    class Config:
        from_attributes = True

class SimulationCreate(BaseModel):
    query: str

class SimulationResponse(BaseModel):
    id: int
    query: str
    category: str
    baseline_co2: float
    created_at: datetime
    recommendations: List[RecommendationResponse]

    class Config:
        from_attributes = True

class DecisionCreate(BaseModel):
    simulation_id: int
    chosen_option: str
    co2_saved: float


# --- TIME MACHINE SCHEMAS ---
class TimeMachineCreate(BaseModel):
    query: str  # e.g., "What if I buy an electric scooter?"

class TimeStep(BaseModel):
    label: str
    current_path_value: float
    alternative_path_value: float
    impact: str
    savings: float
    regret: float
    score_change: int

class TimeMachineResponse(BaseModel):
    query: str
    timeline: List[TimeStep]
    overall_savings: float
    overall_regret: float
    score_delta: int


# --- COPILOT SCHEMAS ---
class CopilotNotification(BaseModel):
    id: str
    type: str  # travel, energy, shopping, food
    title: str
    message: str
    action_label: str
    default_query: str


# --- ANALYTICS SCHEMAS ---
class CarbonScoreResponse(BaseModel):
    score: int
    risk_index: str
    updated_at: datetime

    class Config:
        from_attributes = True

class ForecastResponse(BaseModel):
    forecast_month: str
    predicted_co2: float
    confidence_interval_low: float
    confidence_interval_high: float

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    action: str
    timestamp: datetime
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True
