import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon Shadow AI"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = (
        "AI-powered sustainability intelligence platform that predicts the "
        "environmental impact of future decisions before they happen. "
        "Features an 8-agent LangGraph workflow, Carbon Time Machine, "
        "Regret Engine, blockchain eco-identity, and 13-language support."
    )
    API_V1_STR: str = "/api/v1"

    # Security — JWT
    JWT_SECRET: str = os.urandom(32).hex()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Rate Limiting
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_SIMULATION: str = "30/minute"
    RATE_LIMIT_GENERAL: str = "60/minute"

    # Database
    DATABASE_URL: str = "sqlite:///./carbon_shadow.db"

    # OpenAI — set to "mock" for deterministic fallback, or provide real key
    OPENAI_API_KEY: str = "mock"

    # Blockchain (Polygon Amoy Testnet)
    POLYGON_RPC_URL: str = "https://rpc-amoy.polygon.technology/"
    CONTRACT_ADDRESS: str = ""

    # Voice AI (Optional)
    AZURE_SPEECH_KEY: str = ""
    AZURE_SPEECH_REGION: str = "centralindia"
    ELEVENLABS_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
