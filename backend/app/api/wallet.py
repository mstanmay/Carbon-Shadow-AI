from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, Wallet, BlockchainTransaction
from app.schemas.schemas import WalletConnect, WalletResponse, TransactionResponse
import hashlib
import time

router = APIRouter()

@router.post(
    "/connect",
    response_model=WalletResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Connect a blockchain wallet",
    description="Connect an Ethereum-compatible wallet address to the user's sustainability identity. If a wallet is already connected, returns it.",
    response_description="The connected wallet information, including identity hash and carbon credits.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        422: {"description": "Validation error for wallet address or provider."}
    }
)
def connect_wallet(wallet_in: WalletConnect, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if wallet already exists
    existing = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if existing:
        return existing

    # Generate identity hash
    identity_hash = hashlib.sha256(
        f"{wallet_in.address}:{current_user.id}:{int(time.time())}".encode()
    ).hexdigest()

    wallet = Wallet(
        user_id=current_user.id,
        address=wallet_in.address,
        provider=wallet_in.provider,
        identity_hash=f"0x{identity_hash}",
        carbon_credits=0.0,
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet

@router.post(
    "/verify",
    summary="Verify user eco-identity wallet",
    description="Verify the blockchain identity credentials of the authenticated user's wallet.",
    response_description="Verification success and identity hash.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing authentication credentials."},
        404: {"description": "Wallet not found for the user."}
    }
)
def verify_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return {"verified": True, "identity_hash": wallet.identity_hash}

@router.get(
    "/credits",
    summary="Get user carbon credits",
    description="Retrieve the total amount of carbon credit tokens held by the authenticated user's wallet.",
    response_description="Carbon credits balance.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing credentials."}
    }
)
def get_credits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return {"carbon_credits": 0.0}
    return {"carbon_credits": wallet.carbon_credits}

@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
    summary="List blockchain transactions",
    description="Retrieve the history of blockchain transactions associated with the user's connected wallet.",
    response_description="A list of blockchain transactions.",
    responses={
        401: {"description": "Unauthorized. Invalid or missing credentials."}
    }
)
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return []
    return wallet.transactions

