import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, simulations, wallet, achievements, preferences
from app.models import base  # ensures models are loaded for table creation

# Initialize database tables
Base.metadata.create_all(bind=engine)

from app.core.limiter import limiter

# OpenAPI tags for documentation
tags_metadata = [
    {
        "name": "auth",
        "description": "User registration, login, JWT token management, and profile preferences.",
    },
    {
        "name": "simulations",
        "description": "Core AI simulation engine — 8-agent LangGraph workflow for carbon impact prediction, "
                       "Time Machine timeline projections, proactive Copilot alerts, and decision tracking.",
    },
    {
        "name": "wallet",
        "description": "Blockchain eco-identity — wallet connection, verification, carbon credit tracking, "
                       "and transaction history on Polygon Amoy Testnet.",
    },
    {
        "name": "achievements",
        "description": "Gamified sustainability badges — claim eco achievements and mint them as NFTs.",
    },
    {
        "name": "preferences",
        "description": "User personalization — theme engine (5 themes) and language preferences (13 Indian languages).",
    },
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "Carbon Shadow AI Team",
        "email": "mstanmay777@gmail.com",
    },
    license_info={
        "name": "MIT License",
    },
)

# Attach limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# Custom Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    # Secure Headers (OWASP recommended)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://db.onlinewebfonts.com https://fonts.cdnfonts.com; "
        "font-src 'self' https://fonts.gstatic.com https://db.onlinewebfonts.com https://fonts.cdnfonts.com; "
        "connect-src 'self' ws://localhost:5173 http://localhost:8000 http://localhost:5173; "
        "img-src 'self' data: https://images.higgs.ai https://res.cloudinary.com https://images.unsplash.com;"
    )
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"

    return response


# Register Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(simulations.router, prefix=f"{settings.API_V1_STR}/simulations", tags=["simulations"])
app.include_router(wallet.router, prefix=f"{settings.API_V1_STR}/wallet", tags=["wallet"])
app.include_router(achievements.router, prefix=f"{settings.API_V1_STR}/achievements", tags=["achievements"])
app.include_router(preferences.router, prefix=f"{settings.API_V1_STR}/preferences", tags=["preferences"])


@app.get(
    "/",
    summary="Root greeting",
    description="Returns API status and documentation link.",
    response_description="API health status object",
)
def read_root():
    return {
        "status": "online",
        "service": "Carbon Shadow AI API Engine",
        "version": settings.PROJECT_VERSION,
        "documentation": f"{settings.API_V1_STR}/docs",
    }


@app.get(
    "/healthz",
    summary="Liveness Check",
    description="Simple endpoint to monitor container health.",
    response_description="Liveness status object",
)
def liveness_check():
    return {"status": "ok"}
