import pytest

def test_claim_achievement(client, auth_headers):
    response = client.post(
        "/api/v1/achievements/claim",
        json={
            "badge_type": "eco_commuter",
            "title": "Eco Commuter",
            "description": "Used public transit for 10 commutes.",
            "rarity": "Rare"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["badge_type"] == "eco_commuter"
    assert data["is_minted"] is False

def test_claim_duplicate_achievement(client, auth_headers):
    payload = {
        "badge_type": "eco_commuter",
        "title": "Eco Commuter",
        "description": "Used public transit for 10 commutes.",
        "rarity": "Rare"
    }
    client.post(
        "/api/v1/achievements/claim",
        json=payload,
        headers=auth_headers
    )
    response = client.post(
        "/api/v1/achievements/claim",
        json=payload,
        headers=auth_headers
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Achievement already claimed"

def test_claim_invalid_rarity(client, auth_headers):
    response = client.post(
        "/api/v1/achievements/claim",
        json={
            "badge_type": "eco_commuter",
            "title": "Eco Commuter",
            "description": "Used public transit.",
            "rarity": "SuperRare"  # Not in allowed list: Common, Rare, Epic, Legendary
        },
        headers=auth_headers
    )
    assert response.status_code == 422

def test_mint_achievement(client, auth_headers):
    # Claim first
    claim_res = client.post(
        "/api/v1/achievements/claim",
        json={
            "badge_type": "eco_commuter",
            "title": "Eco Commuter",
            "description": "Used public transit.",
            "rarity": "Rare"
        },
        headers=auth_headers
    )
    ach_id = claim_res.json()["id"]

    # Mint
    response = client.post(
        f"/api/v1/achievements/mint/{ach_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["minted"] is True
    assert "tx_hash" in response.json()

def test_mint_achievement_not_found(client, auth_headers):
    response = client.post(
        "/api/v1/achievements/mint/9999",
        headers=auth_headers
    )
    assert response.status_code == 404

def test_list_achievements(client, auth_headers):
    response = client.get(
        "/api/v1/achievements/",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
