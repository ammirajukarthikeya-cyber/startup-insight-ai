from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Token & Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str
    is_mfa_required: bool = False

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str
    device_info: Optional[str] = None
    ip_address: Optional[str] = None

class OTPVerify(UserBase):
    code: str

class MFAVerify(UserBase):
    email: EmailStr
    code: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    is_verified: bool
    is_mfa_enabled: bool
    subscription_tier: str
    subscription_status: str
    subscription_ends_at: Optional[datetime] = None
    otp_code: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Subscription Plan Schemas ---
class SubscriptionPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    monthly_price: float
    yearly_price: float
    trial_duration_days: int = 0
    features_json: str # Store raw JSON string
    limits_json: str   # Store raw JSON string
    is_enabled: bool = True

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    description: Optional[str] = None
    monthly_price: Optional[float] = None
    yearly_price: Optional[float] = None
    trial_duration_days: Optional[int] = None
    features_json: Optional[str] = None
    limits_json: Optional[str] = None
    is_enabled: Optional[bool] = None

class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Transaction & Checkout Schemas ---
class CheckoutSessionCreate(BaseModel):
    plan_id: int
    billing_cycle: str # "monthly" or "yearly"
    coupon_code: Optional[str] = None
    payment_method: str # "Stripe", "Razorpay", "PayPal", "UPI"

class CheckoutSimulatePayment(BaseModel):
    checkout_token: str
    status: str # "success" or "failed"
    gateway_payment_id: Optional[str] = None
    plan_id: Optional[int] = None
    billing_cycle: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    amount: float
    currency: str
    status: str
    payment_gateway: str
    gateway_payment_id: Optional[str] = None
    invoice_id: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Coupon Schemas ---
class CouponBase(BaseModel):
    code: str
    discount_percent: float
    max_redemptions: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int
    redemptions_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Startup Idea Analysis Schemas ---
class IdeaAnalysisCreate(BaseModel):
    name: Optional[str] = None
    industry: str
    target_market: str
    pitch_text: str

class IdeaAnalysisResponse(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    industry: str
    target_market: str
    pitch_text: str
    feasibility_score: int
    market_score: int
    risk_score: int
    funding_score: int
    health_score: int
    swot_json: str
    competitors_json: str
    vulnerabilities_json: str
    recommendation: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Events Hub Schemas ---
class StartupEventBase(BaseModel):
    title: str
    description: str
    event_type: str
    date: datetime
    location: str
    registration_link: Optional[str] = None

class StartupEventCreate(StartupEventBase):
    pass

class StartupEventResponse(StartupEventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EventBookmarkCreate(BaseModel):
    event_id: int


# --- Tech Updates Schemas ---
class TechUpdateBase(BaseModel):
    title: str
    category: str
    summary: str
    content: str
    source_url: Optional[str] = None
    image_name: Optional[str] = None

class TechUpdateCreate(TechUpdateBase):
    pass

class TechUpdateResponse(TechUpdateBase):
    id: int
    date_published: datetime

    class Config:
        from_attributes = True


# --- Chat Mentor Schemas ---
class ChatMessageBase(BaseModel):
    sender: str # "user" or "system"
    content: str

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(ChatMessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    ip_address: Optional[str] = None
    device_info: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Admin Dashboard Metric Summary ---
class AdminSummaryMetrics(BaseModel):
    total_users: int
    active_users: int
    total_revenue: float
    total_analyses: int
    total_registrations: int
    recent_transactions: List[TransactionResponse]


class ManualPaymentSubmit(BaseModel):
    plan_id: int
    amount: float
    payment_method: str # "UPI" or "Bank Transfer"
    utr_number: str     # The reference number (12-digits UTR)


class PaymentSettingResponse(BaseModel):
    id: int
    upi_id: str
    bank_name: str
    account_holder: str
    account_number: str
    ifsc_code: str

    class Config:
        from_attributes = True


class PaymentSettingUpdate(BaseModel):
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    account_holder: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

