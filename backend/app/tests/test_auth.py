import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

# Setup temporary test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override dependencies
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    assert response.status_code == 201  # 201 Created
    data = response.json()
    assert data["email"] == "tester@carbon.ai"
    assert "id" in data

def test_register_duplicate_email():
    # Register first time
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    # Register second time
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_user():
    # Register
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
