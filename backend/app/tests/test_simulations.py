import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

def get_auth_headers():
    # Register & Login
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_simulation():
    headers = get_auth_headers()
    response = client.post(
        "/api/v1/simulations/",
        json={"query": "I want to travel from Mysore to Bangalore."},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "I want to travel from Mysore to Bangalore."
    assert data["category"] == "Travel"
    assert len(data["recommendations"]) == 3

def test_time_machine():
    headers = get_auth_headers()
    response = client.post(
        "/api/v1/simulations/time-machine",
        json={"query": "What if I buy an electric scooter?"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "What if I buy an electric scooter?"
    assert len(data["timeline"]) == 4
    assert data["overall_savings"] == 138.0

def test_copilot_notifications():
    headers = get_auth_headers()
    response = client.get(
        "/api/v1/simulations/copilot/proactive",
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["type"] == "travel"
