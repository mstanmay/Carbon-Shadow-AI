import pytest

def test_get_theme_default(client, auth_headers):
    response = client.get("/api/v1/preferences/theme", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["theme_name"] == "dark-sustainability"

def test_set_theme(client, auth_headers):
    response = client.put(
        "/api/v1/preferences/theme",
        json={"theme_name": "forest"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["theme_name"] == "forest"

    # Get to confirm
    get_res = client.get("/api/v1/preferences/theme", headers=auth_headers)
    assert get_res.json()["theme_name"] == "forest"

def test_set_invalid_theme(client, auth_headers):
    response = client.put(
        "/api/v1/preferences/theme",
        json={"theme_name": "neon-glow"},  # Not in allowed list
        headers=auth_headers
    )
    assert response.status_code == 422

def test_get_language_default(client, auth_headers):
    response = client.get("/api/v1/preferences/language", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["language_code"] == "en"

def test_set_language(client, auth_headers):
    response = client.put(
        "/api/v1/preferences/language",
        json={"language_code": "hi", "auto_detected": False},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["language_code"] == "hi"

def test_set_invalid_language(client, auth_headers):
    response = client.put(
        "/api/v1/preferences/language",
        json={"language_code": "fr"},  # Not in allowed list
        headers=auth_headers
    )
    assert response.status_code == 422
