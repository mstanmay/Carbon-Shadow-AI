import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.base import User, UserPreferences, CarbonScore

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_carbon_shadow.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def init_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    # Clear tables and re-create for clean tests
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Override app get_db
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def db():
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_user(db):
    user = User(email="testuser@example.com", hashed_password="hashedpassword123")
    db.add(user)
    db.commit()
    db.refresh(user)

    prefs = UserPreferences(user_id=user.id, commute_mode="car_gasoline", diet_type="omnivore")
    db.add(prefs)
    
    score = CarbonScore(user_id=user.id, score=100, risk_index="Low")
    db.add(score)
    db.commit()
    return user

@pytest.fixture
def auth_headers(client):
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
