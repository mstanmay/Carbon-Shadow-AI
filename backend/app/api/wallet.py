from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, Wallet, BlockchainTransaction
from pydantic import BaseModel
from typing import Optional
import hashlib
import time

router = APIRouter()

class WalletConnect(BaseModel):
    address: str
    provider: str  # MetaMask, WalletConnect, Coinbase

class WalletResponse(BaseModel):
    address: str
    provider: str
    identity_hash: Optional[str]
    carbon_credits: float

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    tx_hash: str
    tx_type: str
    amount: float
    metadata: Optional[str]

    class Config:
        from_attributes = True

@router.post("/connect", response_model=WalletResponse)
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

@router.post("/verify")
def verify_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return {"verified": True, "identity_hash": wallet.identity_hash}

@router.get("/credits")
def get_credits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return {"carbon_credits": 0}
    return {"carbon_credits": wallet.carbon_credits}

@router.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return []
    return wallet.transactions
