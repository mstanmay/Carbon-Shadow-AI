import pytest

def test_unauthorized_access(client):
    # Protected route without auth headers should return 401
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_unauthorized_history(client):
    # Protected history route without auth headers should return 401
    response = client.get("/api/v1/simulations/history")
    assert response.status_code == 401

def test_input_bounds_co2_value(client, auth_headers):
    # Decision schema bounds check: co2_saved max value limit
    # co2_saved has max=50000 in schemas.py. Let's send 999999 (should fail with 422)
    response = client.post(
        "/api/v1/simulations/decision",
        json={"simulation_id": 1, "chosen_option": "Eco Option", "co2_saved": 999999.0},
        headers=auth_headers
    )
    assert response.status_code == 422

def test_input_bounds_query_length(client, auth_headers):
    # Simulation schema bounds check: query too long
    # max_length is 500. Let's send a query of 1000 characters
    long_query = "What if I " + ("a" * 1000)
    response = client.post(
        "/api/v1/simulations/",
        json={"query": long_query},
        headers=auth_headers
    )
    assert response.status_code == 422

def test_rate_limiting_auth(client):
    from app.core.limiter import limiter
    # Temporarily enable the limiter for this test
    old_enabled = limiter.enabled
    limiter.enabled = True
    try:
        # Register/login endpoint has rate limit 10/minute.
        # Let's send 15 rapid register requests. One of them should fail with 429.
        responses = []
        for i in range(15):
            res = client.post(
                "/api/v1/auth/login",
                json={"email": f"tester_limit_{i}@carbon.ai", "password": "password123"}
            )
            responses.append(res.status_code)
        
        # Assert that at least one request was rate limited
        assert 429 in responses
    finally:
        limiter.enabled = old_enabled

