import pytest

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "tester@carbon.ai"
    assert "id" in data

def test_register_weak_password(client):
    # No digit in password (should fail Pydantic validation)
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password"}
    )
    assert response.status_code == 422

def test_register_duplicate_email(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_user(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tester@carbon.ai", "password": "wrongpassword123"}
    )
    assert response.status_code == 400

def test_refresh_token(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "tester@carbon.ai", "password": "password123"}
    )
    refresh_token = login_res.json()["refresh_token"]

    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "tester@carbon.ai"

def test_get_preferences(client, auth_headers):
    response = client.get("/api/v1/auth/me/preferences", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "theme" in data
    assert "commute_mode" in data

def test_update_preferences(client, auth_headers):
    response = client.put(
        "/api/v1/auth/me/preferences",
        json={"theme": "forest", "commute_mode": "electric_scooter", "diet_type": "vegan"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["theme"] == "forest"
    assert data["commute_mode"] == "electric_scooter"
    assert data["diet_type"] == "vegan"

def test_update_invalid_preference(client, auth_headers):
    response = client.put(
        "/api/v1/auth/me/preferences",
        json={"commute_mode": "invalid_mode_here"},
        headers=auth_headers
    )
    assert response.status_code == 422
