from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Literal
from datetime import datetime
import re

# ── ALLOWED VALUES ───────────────────────────────────────────

ALLOWED_THEMES = [
    "dark-sustainability", "light-sustainability", "forest", "solar", "ocean"
]

ALLOWED_LANGUAGES = [
    "en", "hi", "kn", "ta", "te", "ml", "mr", "bn", "gu", "pa", "or", "ur", "as"
]

ALLOWED_COMMUTE_MODES = [
    "car_gasoline", "car_diesel", "electric_vehicle",
    "public_transit", "bicycle", "motorcycle", "electric_scooter"
]

ALLOWED_DIET_TYPES = ["omnivore", "pescatarian", "vegetarian", "vegan"]

ALLOWED_WALLET_PROVIDERS = ["MetaMask", "WalletConnect", "Coinbase"]


# ── AUTH & USER SCHEMAS ──────────────────────────────────────

class UserCreate(BaseModel):
    """User registration payload."""
    email: EmailStr
    password: str = Field(
        ..., min_length=8, max_length=128,
        description="Password must be 8-128 characters with at least one digit.",
        json_schema_extra={"example": "securePass123"}
    )

    @field_validator("password")
    @classmethod
    def password_must_contain_digit(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """User login payload."""
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    """User profile response."""
    id: int
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request body."""
    refresh_token: str = Field(..., min_length=10, max_length=2048)


# ── PREFERENCES SCHEMAS ─────────────────────────────────────

class UserPreferencesResponse(BaseModel):
    """User sustainability preferences."""
    theme: str
    currency: str
    commute_mode: str
    diet_type: str

    class Config:
        from_attributes = True


class UserPreferencesUpdate(BaseModel):
    """Update user sustainability preferences."""
    theme: Optional[str] = Field(None, description="UI theme")
    currency: Optional[str] = Field(None, min_length=2, max_length=10)
    commute_mode: Optional[str] = Field(None, description="Primary commute mode")
    diet_type: Optional[str] = Field(None, description="Dietary preference")

    @field_validator("commute_mode")
    @classmethod
    def validate_commute(cls, v):
        if v is not None and v not in ALLOWED_COMMUTE_MODES:
            raise ValueError(f"commute_mode must be one of: {ALLOWED_COMMUTE_MODES}")
        return v

    @field_validator("diet_type")
    @classmethod
    def validate_diet(cls, v):
        if v is not None and v not in ALLOWED_DIET_TYPES:
            raise ValueError(f"diet_type must be one of: {ALLOWED_DIET_TYPES}")
        return v


# ── SIMULATION & RECOMMENDATION SCHEMAS ──────────────────────

class RecommendationResponse(BaseModel):
    """AI-generated carbon recommendation."""
    option_name: str
    co2_value: float = Field(ge=0, le=100000, description="CO2 in kg")
    reasoning: str
    savings_potential: float = Field(ge=-100000, le=100000, description="Savings vs baseline in kg CO2")

    class Config:
        from_attributes = True


class SimulationCreate(BaseModel):
    """Carbon simulation request."""
    query: str = Field(
        ..., min_length=3, max_length=500,
        description="Natural language query about a decision's carbon impact.",
        json_schema_extra={"example": "What if I drive from Mysore to Bangalore?"}
    )


class SimulationResponse(BaseModel):
    """Carbon simulation result with AI recommendations."""
    id: int
    query: str
    category: str
    baseline_co2: float
    created_at: datetime
    recommendations: List[RecommendationResponse]

    class Config:
        from_attributes = True


class DecisionCreate(BaseModel):
    """Commit to a recommended decision."""
    simulation_id: int = Field(ge=1, description="ID of the simulation to act on")
    chosen_option: str = Field(min_length=1, max_length=100, description="Name of chosen option")
    co2_saved: float = Field(ge=0, le=50000, description="CO2 saved in kg")


# ── TIME MACHINE SCHEMAS ────────────────────────────────────

class TimeMachineCreate(BaseModel):
    """Time Machine simulation request."""
    query: str = Field(
        ..., min_length=3, max_length=500,
        description="What-if query for timeline projection.",
        json_schema_extra={"example": "What if I buy an electric scooter?"}
    )


class TimeStep(BaseModel):
    """A single step in the Time Machine timeline."""
    label: str
    current_path_value: float = Field(ge=0)
    alternative_path_value: float = Field(ge=0)
    impact: str
    savings: float
    regret: float
    score_change: int = Field(ge=0, le=100)


class TimeMachineResponse(BaseModel):
    """Time Machine timeline projection result."""
    query: str
    timeline: List[TimeStep]
    overall_savings: float
    overall_regret: float
    score_delta: int


# ── COPILOT SCHEMAS ──────────────────────────────────────────

class CopilotNotification(BaseModel):
    """Proactive AI copilot suggestion."""
    id: str
    type: str
    title: str
    message: str
    action_label: str
    default_query: str


# ── ANALYTICS SCHEMAS ────────────────────────────────────────

class CarbonScoreResponse(BaseModel):
    """User's carbon sustainability score."""
    score: int = Field(ge=0, le=100)
    risk_index: str
    updated_at: datetime

    class Config:
        from_attributes = True


class ForecastResponse(BaseModel):
    """Carbon forecast data point."""
    forecast_month: str
    predicted_co2: float
    confidence_interval_low: float
    confidence_interval_high: float

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    """Security audit log entry."""
    action: str
    timestamp: datetime
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True


# ── WALLET SCHEMAS ───────────────────────────────────────────

class WalletConnect(BaseModel):
    """Wallet connection request."""
    address: str = Field(
        ..., min_length=42, max_length=42,
        description="Ethereum-compatible wallet address (0x...)",
        json_schema_extra={"example": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"}
    )
    provider: str = Field(..., description="Wallet provider name")

    @field_validator("address")
    @classmethod
    def validate_eth_address(cls, v: str) -> str:
        if not re.match(r"^0x[0-9a-fA-F]{40}$", v):
            raise ValueError("Invalid Ethereum address format. Must be 0x followed by 40 hex characters.")
        return v

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        if v not in ALLOWED_WALLET_PROVIDERS:
            raise ValueError(f"provider must be one of: {ALLOWED_WALLET_PROVIDERS}")
        return v


class WalletResponse(BaseModel):
    """Wallet connection response."""
    address: str
    provider: str
    identity_hash: Optional[str]
    carbon_credits: float

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """Blockchain transaction record."""
    tx_hash: str
    tx_type: str
    amount: float
    tx_metadata: Optional[str] = None

    class Config:
        from_attributes = True


# ── PREFERENCES UPDATE SCHEMAS ───────────────────────────────

class ThemeUpdate(BaseModel):
    """Update UI theme."""
    theme_name: str

    @field_validator("theme_name")
    @classmethod
    def validate_theme(cls, v: str) -> str:
        if v not in ALLOWED_THEMES:
            raise ValueError(f"theme_name must be one of: {ALLOWED_THEMES}")
        return v


class LanguageUpdate(BaseModel):
    """Update language preference."""
    language_code: str
    auto_detected: bool = False

    @field_validator("language_code")
    @classmethod
    def validate_language(cls, v: str) -> str:
        if v not in ALLOWED_LANGUAGES:
            raise ValueError(f"language_code must be one of: {ALLOWED_LANGUAGES}")
        return v


# ── ACHIEVEMENT SCHEMAS ──────────────────────────────────────

class AchievementClaim(BaseModel):
    """Claim an eco achievement badge."""
    badge_type: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    rarity: str = Field(default="Common")

    @field_validator("rarity")
    @classmethod
    def validate_rarity(cls, v: str) -> str:
        if v not in ["Common", "Rare", "Epic", "Legendary"]:
            raise ValueError("rarity must be one of: Common, Rare, Epic, Legendary")
        return v


class AchievementResponse(BaseModel):
    """Achievement badge response."""
    id: int
    badge_type: str
    title: str
    description: Optional[str]
    rarity: str
    is_minted: bool
    earned_at: datetime

    class Config:
        from_attributes = True
