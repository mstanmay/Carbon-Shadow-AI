from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon Shadow AI"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "supersecretjwtkeyforcarbonshadowai"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite:///./carbon_shadow.db"
    
    # OpenAI
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
