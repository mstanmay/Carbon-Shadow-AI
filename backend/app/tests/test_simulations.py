import pytest

def test_create_simulation(client, auth_headers):
    response = client.post(
        "/api/v1/simulations/",
        json={"query": "I want to travel from Mysore to Bangalore."},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["query"] == "I want to travel from Mysore to Bangalore."
    assert data["category"] == "Travel"
    assert len(data["recommendations"]) == 3

def test_create_simulation_invalid_query(client, auth_headers):
    # Too short query
    response = client.post(
        "/api/v1/simulations/",
        json={"query": "ab"},
        headers=auth_headers
    )
    assert response.status_code == 422

def test_get_simulation_history_paginated(client, auth_headers):
    # Perform 3 simulations
    for i in range(3):
        client.post(
            "/api/v1/simulations/",
            json={"query": f"I want to travel from Mysore to Bangalore {i}."},
            headers=auth_headers
        )

    # Fetch history with limit = 2
    response = client.get(
        "/api/v1/simulations/history?skip=0&limit=2",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert "X-Total-Count" in response.headers
    assert int(response.headers["X-Total-Count"]) == 3

def test_make_decision(client, auth_headers):
    # First create a simulation
    sim_res = client.post(
        "/api/v1/simulations/",
        json={"query": "I want to buy a laptop."},
        headers=auth_headers
    )
    sim_id = sim_res.json()["id"]

    # Commit to a decision
    response = client.post(
        "/api/v1/simulations/decision",
        json={"simulation_id": sim_id, "chosen_option": "Eco Option", "co2_saved": 270.0},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "new_score" in data

def test_make_decision_invalid_simulation(client, auth_headers):
    response = client.post(
        "/api/v1/simulations/decision",
        json={"simulation_id": 99999, "chosen_option": "Eco Option", "co2_saved": 270.0},
        headers=auth_headers
    )
    assert response.status_code == 404

def test_time_machine(client, auth_headers):
    response = client.post(
        "/api/v1/simulations/time-machine",
        json={"query": "What if I buy an electric scooter?"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "What if I buy an electric scooter?"
    assert len(data["timeline"]) == 4
    assert data["overall_savings"] == 138.0

def test_copilot_notifications(client, auth_headers):
    response = client.get(
        "/api/v1/simulations/copilot/proactive",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["type"] == "travel"

def test_dashboard_stats(client, auth_headers):
    response = client.get(
        "/api/v1/simulations/dashboard/stats",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "risk_index" in data
    assert "total_saved" in data
    assert "category_split" in data
    assert "forecast" in data
