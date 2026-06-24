import pytest

def test_connect_wallet(client, auth_headers):
    response = client.post(
        "/api/v1/wallet/connect",
        json={"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", "provider": "MetaMask"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["address"] == "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"
    assert data["provider"] == "MetaMask"
    assert "identity_hash" in data

def test_connect_wallet_invalid_address(client, auth_headers):
    # Non-hex address or wrong size
    response = client.post(
        "/api/v1/wallet/connect",
        json={"address": "0xInvalidEthAddressHereBecauseOfLengthAndChars", "provider": "MetaMask"},
        headers=auth_headers
    )
    assert response.status_code == 422

def test_connect_wallet_invalid_provider(client, auth_headers):
    # Provider not in the allowed list
    response = client.post(
        "/api/v1/wallet/connect",
        json={"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", "provider": "UnknownProvider"},
        headers=auth_headers
    )
    assert response.status_code == 422

def test_verify_wallet(client, auth_headers):
    # Connect first
    client.post(
        "/api/v1/wallet/connect",
        json={"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", "provider": "MetaMask"},
        headers=auth_headers
    )
    # Verify
    response = client.post(
        "/api/v1/wallet/verify",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert "identity_hash" in data

def test_verify_wallet_not_found(client, auth_headers):
    response = client.post(
        "/api/v1/wallet/verify",
        headers=auth_headers
    )
    assert response.status_code == 404

def test_get_credits(client, auth_headers):
    response = client.get(
        "/api/v1/wallet/credits",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "carbon_credits" in response.json()

def test_get_transactions(client, auth_headers):
    response = client.get(
        "/api/v1/wallet/transactions",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
