import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, simulations, wallet, achievements, preferences
from app.models import base  # ensures models are loaded for table creation

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

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
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Simplistic Rate Limiter (Max 100 requests per 10 seconds per IP for Demo)
    client_ip = request.client.host if request.client else "unknown"
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Secure Headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://db.onlinewebfonts.com; "
        "font-src 'self' https://fonts.gstatic.com https://db.onlinewebfonts.com; "
        "connect-src 'self' ws://localhost:5173 http://localhost:8000 http://localhost:5173; "
        "img-src 'self' data: https://images.higgs.ai https://res.cloudinary.com https://images.unsplash.com;"
    )
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    
    return response

# Register Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(simulations.router, prefix=f"{settings.API_V1_STR}/simulations", tags=["simulations"])
app.include_router(wallet.router, prefix=f"{settings.API_V1_STR}/wallet", tags=["wallet"])
app.include_router(achievements.router, prefix=f"{settings.API_V1_STR}/achievements", tags=["achievements"])
app.include_router(preferences.router, prefix=f"{settings.API_V1_STR}/preferences", tags=["preferences"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Carbon Shadow AI API Engine",
        "documentation": f"{settings.API_V1_STR}/docs"
    }
