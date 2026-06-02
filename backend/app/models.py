from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # "user", "admin"
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    
    # MFA Settings
    is_mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String, nullable=True)
    mfa_temp_secret = Column(String, nullable=True)
    
    # Billing Settings
    subscription_tier = Column(String, default="Free") # "Free", "Basic", "Pro", "Enterprise"
    subscription_status = Column(String, default="inactive") # "active", "cancelled", "trialing", "inactive"
    subscription_ends_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("IdeaAnalysis", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("EventBookmark", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, index=True, nullable=False)
    device_info = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    is_valid = Column(Boolean, default=True)
    login_time = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="sessions")


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    monthly_price = Column(Float, nullable=False)
    yearly_price = Column(Float, nullable=False)
    trial_duration_days = Column(Integer, default=0)
    features_json = Column(Text, nullable=False) # JSON array of feature descriptions
    limits_json = Column(Text, nullable=False)   # JSON mapping of usage limit metrics (e.g. {"scans": 10})
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="plan")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, nullable=False) # "Success", "Failed", "Refunded"
    payment_gateway = Column(String, nullable=False) # "Stripe", "Razorpay", "PayPal", "UPI"
    gateway_payment_id = Column(String, nullable=True)
    gateway_order_id = Column(String, nullable=True)
    invoice_id = Column(String, unique=True, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")
    plan = relationship("SubscriptionPlan", back_populates="transactions")


class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    max_redemptions = Column(Integer, nullable=True)
    redemptions_count = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class IdeaAnalysis(Base):
    __tablename__ = "idea_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=True)
    industry = Column(String, nullable=False)
    target_market = Column(String, nullable=False)
    pitch_text = Column(Text, nullable=False)
    
    # AI Output Scores
    feasibility_score = Column(Integer, nullable=False)
    market_score = Column(Integer, nullable=False)
    risk_score = Column(Integer, nullable=False)
    funding_score = Column(Integer, nullable=False)
    health_score = Column(Integer, nullable=False)
    
    # Complex JSON structures stored as text
    swot_json = Column(Text, nullable=False)          # {"strengths": [], "weaknesses": []}
    competitors_json = Column(Text, nullable=False)   # List of direct/indirect competitor items
    vulnerabilities_json = Column(Text, nullable=False) # Risk categories and mitgation bullets
    recommendation = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="analyses")


class StartupEvent(Base):
    __tablename__ = "startup_events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    event_type = Column(String, nullable=False) # "hackathons", "conferences", "pitch"
    date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    registration_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookmarks = relationship("EventBookmark", back_populates="event", cascade="all, delete-orphan")


class EventBookmark(Base):
    __tablename__ = "event_bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("startup_events.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="bookmarks")
    event = relationship("StartupEvent", back_populates="bookmarks")


class TechUpdate(Base):
    __tablename__ = "tech_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # "ai", "cybersecurity", "cloud", "blockchain", "saas"
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    source_url = Column(String, nullable=True)
    image_name = Column(String, nullable=True)
    date_published = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False) # "user" or "system"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chat_history")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    action = Column(String, nullable=False) # e.g. "login_success", "failed_mfa", "suspension"
    ip_address = Column(String, nullable=True)
    device_info = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")
