from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from typing import Optional
from app import models, schemas

# --- User CRUD ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_pass: str):
    # Generates a random 6-digit OTP for email verification simulation
    otp = f"{random.randint(100000, 999999)}"
    expires = datetime.utcnow() + timedelta(minutes=15)
    
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_pass,
        otp_code=otp,
        otp_expires_at=expires,
        is_verified=False,
        role="admin" if user.email.startswith("admin@") else "user" # Auto-admin for matching emails
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_otp(db: Session, user: models.User):
    otp = f"{random.randint(100000, 999999)}"
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    db.refresh(user)
    return user

def create_user_session(db: Session, user_id: int, token: str, device_info: Optional[str], ip_address: Optional[str]):
    session = models.UserSession(
        user_id=user_id,
        token=token,
        device_info=device_info,
        ip_address=ip_address,
        is_valid=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def invalidate_user_session(db: Session, token: str):
    session = db.query(models.UserSession).filter(models.UserSession.token == token).first()
    if session:
        session.is_valid = False
        db.commit()
    return session

# --- Audit Logs CRUD ---
def create_audit_log(db: Session, action: str, user_id: Optional[int] = None, ip_address: Optional[str] = None, device_info: Optional[str] = None):
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        ip_address=ip_address,
        device_info=device_info
    )
    db.add(log)
    db.commit()
    return log

# --- Subscription Plans CRUD ---
def get_plans(db: Session):
    return db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.is_enabled == True).all()

def get_all_plans(db: Session):
    return db.query(models.SubscriptionPlan).all()

def get_plan(db: Session, plan_id: int):
    return db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.id == plan_id).first()

def get_plan_by_name(db: Session, name: str):
    return db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.name == name).first()

def create_plan(db: Session, plan: schemas.SubscriptionPlanCreate):
    db_plan = models.SubscriptionPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def update_plan(db: Session, plan_id: int, plan_update: schemas.SubscriptionPlanUpdate):
    db_plan = get_plan(db, plan_id)
    if not db_plan:
        return None
    for key, val in plan_update.dict(exclude_unset=True).items():
        setattr(db_plan, key, val)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def delete_plan(db: Session, plan_id: int):
    db_plan = get_plan(db, plan_id)
    if db_plan:
        db.delete(db_plan)
        db.commit()
        return True
    return False

# --- Transaction & Coupon CRUD ---
def get_coupon(db: Session, code: str):
    return db.query(models.Coupon).filter(models.Coupon.code == code, models.Coupon.is_active == True).first()

def create_coupon(db: Session, coupon: schemas.CouponCreate):
    db_coupon = models.Coupon(**coupon.dict())
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return db_coupon

def create_transaction(db: Session, transaction: schemas.TransactionResponse):
    db_tx = models.Transaction(
        user_id=transaction.user_id,
        plan_id=transaction.plan_id,
        amount=transaction.amount,
        currency=transaction.currency,
        status=transaction.status,
        payment_gateway=transaction.payment_gateway,
        gateway_payment_id=transaction.gateway_payment_id,
        invoice_id=transaction.invoice_id
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx

# --- Idea Analysis CRUD ---
def create_idea_analysis(db: Session, user_id: int, analysis: schemas.IdeaAnalysisResponse):
    db_analysis = models.IdeaAnalysis(
        user_id=user_id,
        name=analysis.name,
        industry=analysis.industry,
        target_market=analysis.target_market,
        pitch_text=analysis.pitch_text,
        feasibility_score=analysis.feasibility_score,
        market_score=analysis.market_score,
        risk_score=analysis.risk_score,
        funding_score=analysis.funding_score,
        health_score=analysis.health_score,
        swot_json=analysis.swot_json,
        competitors_json=analysis.competitors_json,
        vulnerabilities_json=analysis.vulnerabilities_json,
        recommendation=analysis.recommendation
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis

def get_user_analyses(db: Session, user_id: int):
    return db.query(models.IdeaAnalysis).filter(models.IdeaAnalysis.user_id == user_id).order_by(models.IdeaAnalysis.timestamp.desc()).all()

# --- Events CRUD ---
def get_events(db: Session):
    return db.query(models.StartupEvent).order_by(models.StartupEvent.date.asc()).all()

def create_event(db: Session, event: schemas.StartupEventCreate):
    db_event = models.StartupEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def delete_event(db: Session, event_id: int):
    db_event = db.query(models.StartupEvent).filter(models.StartupEvent.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
        return True
    return False

def add_bookmark(db: Session, user_id: int, event_id: int):
    existing = db.query(models.EventBookmark).filter(
        models.EventBookmark.user_id == user_id, 
        models.EventBookmark.event_id == event_id
    ).first()
    if existing:
        return existing
    db_bookmark = models.EventBookmark(user_id=user_id, event_id=event_id)
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

def remove_bookmark(db: Session, user_id: int, event_id: int):
    bookmark = db.query(models.EventBookmark).filter(
        models.EventBookmark.user_id == user_id, 
        models.EventBookmark.event_id == event_id
    ).first()
    if bookmark:
        db.delete(bookmark)
        db.commit()
        return True
    return False

# --- Tech Updates CRUD ---
def get_tech_updates(db: Session):
    return db.query(models.TechUpdate).order_by(models.TechUpdate.date_published.desc()).all()

def create_tech_update(db: Session, update: schemas.TechUpdateCreate):
    db_update = models.TechUpdate(**update.dict())
    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    return db_update

def delete_tech_update(db: Session, update_id: int):
    db_update = db.query(models.TechUpdate).filter(models.TechUpdate.id == update_id).first()
    if db_update:
        db.delete(db_update)
        db.commit()
        return True
    return False

# --- Chat Messages CRUD ---
def get_chat_history(db: Session, user_id: int):
    return db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user_id).order_by(models.ChatMessage.timestamp.asc()).all()

def add_chat_message(db: Session, user_id: int, sender: str, content: str):
    msg = models.ChatMessage(user_id=user_id, sender=sender, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
