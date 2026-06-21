from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # user, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    simulations = relationship("CarbonSimulation", back_populates="user", cascade="all, delete-orphan")
    decisions = relationship("DecisionHistory", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="user", cascade="all, delete-orphan")
    carbon_score = relationship("CarbonScore", back_populates="user", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    theme_preference = relationship("UserTheme", back_populates="user", uselist=False, cascade="all, delete-orphan")
    language_preference = relationship("UserLanguage", back_populates="user", uselist=False, cascade="all, delete-orphan")
    voice_history = relationship("VoiceHistory", back_populates="user", cascade="all, delete-orphan")
    carbon_credits = relationship("CarbonCredit", back_populates="user", cascade="all, delete-orphan")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    theme = Column(String, default="dark")  # dark, light
    currency = Column(String, default="USD")
    commute_mode = Column(String, default="car_gasoline")  # transit, EV, etc.
    diet_type = Column(String, default="omnivore")  # vegan, vegetarian, etc.

    user = relationship("User", back_populates="preferences")


class CarbonSimulation(Base):
    __tablename__ = "carbon_simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # nullable for anonymous simulation tests
    query = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Travel, Shopping, Food, Lifestyle
    baseline_co2 = Column(Float, nullable=False)  # in kg CO2
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="simulations")
    recommendations = relationship("Recommendation", back_populates="simulation", cascade="all, delete-orphan")
    decisions = relationship("DecisionHistory", back_populates="simulation", cascade="all, delete-orphan")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    simulation_id = Column(Integer, ForeignKey("carbon_simulations.id", ondelete="CASCADE"), nullable=False)
    option_name = Column(String, nullable=False)  # Best, Balanced, Eco, or specific text
    co2_value = Column(Float, nullable=False)  # in kg CO2
    reasoning = Column(Text, nullable=False)
    savings_potential = Column(Float, nullable=False)  # comparison vs baseline

    simulation = relationship("CarbonSimulation", back_populates="recommendations")


class DecisionHistory(Base):
    __tablename__ = "decision_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    simulation_id = Column(Integer, ForeignKey("carbon_simulations.id", ondelete="CASCADE"), nullable=False)
    chosen_option = Column(String, nullable=False)  # Eco, Balanced, Best
    co2_saved = Column(Float, nullable=False)  # kg CO2
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="decisions")
    simulation = relationship("CarbonSimulation", back_populates="decisions")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    forecast_month = Column(String, nullable=False)  # YYYY-MM
    predicted_co2 = Column(Float, nullable=False)
    confidence_interval_low = Column(Float, nullable=False)
    confidence_interval_high = Column(Float, nullable=False)

    user = relationship("User", back_populates="forecasts")


class CarbonScore(Base):
    __tablename__ = "carbon_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    score = Column(Integer, default=100)  # 0 to 100
    risk_index = Column(String, default="Low")  # Low, Medium, High
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="carbon_score")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    address = Column(String, unique=True, nullable=False)
    provider = Column(String, nullable=False)  # MetaMask, WalletConnect, Coinbase
    identity_hash = Column(String, nullable=True)
    carbon_credits = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("BlockchainTransaction", back_populates="wallet", cascade="all, delete-orphan")


class BlockchainTransaction(Base):
    __tablename__ = "blockchain_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    tx_hash = Column(String, nullable=False)
    tx_type = Column(String, nullable=False)  # register, mint_badge, store_credits
    amount = Column(Float, default=0.0)
    tx_metadata = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_type = Column(String, nullable=False)  # eco_explorer, green_commuter, etc.
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    rarity = Column(String, default="Common")  # Common, Rare, Epic, Legendary
    is_minted = Column(Boolean, default=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")


class UserTheme(Base):
    __tablename__ = "user_themes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    theme_name = Column(String, default="dark-sustainability")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="theme_preference")


class UserLanguage(Base):
    __tablename__ = "user_languages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    language_code = Column(String, default="en")
    auto_detected = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="language_preference")


class VoiceHistory(Base):
    __tablename__ = "voice_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    input_text = Column(Text, nullable=False)
    output_text = Column(Text, nullable=False)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="voice_history")


class CarbonCredit(Base):
    __tablename__ = "carbon_credits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)  # simulation, achievement, referral
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="carbon_credits")

