from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
from app.database import engine, Base, get_db
from app.config import settings
from app.routes import auth as auth_router, user as user_router, analyzer as analyzer_router, billing as billing_router, events as events_router, news as news_router, mentor as mentor_router, admin as admin_router
from app import models, auth as security


app = FastAPI(
    title="Startup Insight AI API",
    description="SaaS Backend API for Startup Idea Screen, Competitor mapping, Vulnerabilities assessment, and AI Mentor guidance.",
    version="1.0.0"
)

# Apply CORS origins policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down to the Next.js origin domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register app router endpoints
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(analyzer_router.router)
app.include_router(billing_router.router)
app.include_router(events_router.router)
app.include_router(news_router.router)
app.include_router(mentor_router.router)
app.include_router(admin_router.router)


@app.get("/")
def read_root():
    return {"message": "Startup Insight AI API service is online."}


# Database Seeding on Startup
@app.on_event("startup")
def seed_database():
    try:
        # Create database tables if they do not exist yet
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[DB INIT ERROR] Failed to create database tables: {e}")
        # Re-raise so the process exits, but at least we get a clear log statement
        raise e
        
    db = next(get_db())
    try:
        # 1. Seed Default Admin Account if missing
        admin_email = "admin@startupinsight.ai"
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin:
            hashed_pass = security.get_password_hash("adminsecure123")
            admin_user = models.User(
                email=admin_email,
                hashed_password=hashed_pass,
                role="admin",
                is_active=True,
                is_verified=True,
                subscription_tier="Enterprise",
                subscription_status="active"
            )
            db.add(admin_user)
            db.commit()
            print(f"[SEED] Created Admin User: {admin_email} / adminsecure123")
            
        # 2. Seed Default User if missing (for easy testing)
        user_email = "demo@startupinsight.ai"
        demo_user = db.query(models.User).filter(models.User.email == user_email).first()
        if not demo_user:
            hashed_pass = security.get_password_hash("demopass123")
            new_demo = models.User(
                email=user_email,
                hashed_password=hashed_pass,
                role="user",
                is_active=True,
                is_verified=True,
                subscription_tier="Free",
                subscription_status="inactive"
            )
            db.add(new_demo)
            db.commit()
            print(f"[SEED] Created Demo User: {user_email} / demopass123")

        # 3. Seed Default Subscription Plans if empty
        if db.query(models.SubscriptionPlan).count() == 0:
            plans = [
                {
                    "name": "Basic Plan",
                    "description": "Essential validation scans for early entrepreneurs.",
                    "monthly_price": 299.0,
                    "yearly_price": 2990.0,
                    "trial_duration_days": 7,
                    "features_json": json.dumps([
                        "5 Idea analyses per month",
                        "Standard competitor discovery maps",
                        "Basic SWOT analysis profile",
                        "24/7 AI mentor chat limited"
                    ]),
                    "limits_json": json.dumps({"scans": 5, "chat_messages": 50}),
                    "is_enabled": True
                },
                {
                    "name": "Pro Plan",
                    "description": "Comprehensive analyzer with investor-ready diagnostic indices.",
                    "monthly_price": 999.0,
                    "yearly_price": 9990.0,
                    "trial_duration_days": 7,
                    "features_json": json.dumps([
                        "Unlimited startup idea analyses",
                        "Deep competitor market-share mapping",
                        "Full risk vulnerability mitigations",
                        "Unlimited Startup AI Mentor chats",
                        "Valuation Brief PDF export prints"
                    ]),
                    "limits_json": json.dumps({"scans": -1, "chat_messages": -1}),
                    "is_enabled": True
                },
                {
                    "name": "Enterprise Plan",
                    "description": "Custom neural modeling with direct VC match pipelines.",
                    "monthly_price": 4999.0,
                    "yearly_price": 49990.0,
                    "trial_duration_days": 14,
                    "features_json": json.dumps([
                        "Everything in Pro Plan",
                        "Direct match connections to VCs & Angels",
                        "Custom team seats (up to 5 co-founders)",
                        "Dedicated API connector bandwidth routes",
                        "Admin control panel and priority support"
                    ]),
                    "limits_json": json.dumps({"scans": -1, "chat_messages": -1}),
                    "is_enabled": True
                }
            ]
            for p in plans:
                db_p = models.SubscriptionPlan(**p)
                db.add(db_p)
            db.commit()
            print("[SEED] Created default subscription plans.")

        # 4. Seed Default Coupons if empty
        if db.query(models.Coupon).count() == 0:
            coupons = [
                {"code": "WELCOME50", "discount_percent": 50.0, "max_redemptions": 100, "is_active": True},
                {"code": "LAUNCH20", "discount_percent": 20.0, "max_redemptions": 500, "is_active": True}
            ]
            for c in coupons:
                db_c = models.Coupon(**c)
                db.add(db_c)
            db.commit()
            print("[SEED] Created discount coupon codes.")

        # 5. Seed Default Events if empty
        if db.query(models.StartupEvent).count() == 0:
            events = [
                {
                    "title": "Global AI Hackathon 2026",
                    "description": "Compete with developer teams worldwide to code production-grade multi-agent networks. $100k API grants.",
                    "event_type": "hackathons",
                    "date": datetime.utcnow() + timedelta(days=16),
                    "location": "Online / Discord",
                    "registration_link": "https://discord.gg/ai-hackathon-2026"
                },
                {
                    "title": "SaaS Founders Growth Summit",
                    "description": "Three days of masterclasses, networking, and early seed investment pitches with 200+ VC firms.",
                    "event_type": "conferences",
                    "date": datetime.utcnow() + timedelta(days=33),
                    "location": "San Francisco, CA",
                    "registration_link": "https://foundersgrow2026.com"
                },
                {
                    "title": "Ecosystem Pitch Showcase 2026",
                    "description": "Pitch your validated concept live to a panel of early stage angel networks. Non-dilutive grants to top winner.",
                    "event_type": "pitch",
                    "date": datetime.utcnow() + timedelta(days=70),
                    "location": "Virtual / Zoom",
                    "registration_link": "https://showcase.startupinsight.ai"
                }
            ]
            for e in events:
                db_e = models.StartupEvent(**e)
                db.add(db_e)
            db.commit()
            print("[SEED] Seeded default startup events catalog.")

        # 6. Seed Default Tech Updates if empty
        if db.query(models.TechUpdate).count() == 0:
            updates = [
                {
                    "title": "Sovereign Small Models and Custom Neural Edge: The SaaS Pivot",
                    "category": "ai",
                    "summary": "Startups are moving away from monolithic GPT API queries to custom model routers operating locally to trim runways.",
                    "content": "Sovereign model deployment represents a major runway strategy shift for pre-seed software models. We analyze unit token prices."
                },
                {
                    "title": "SQL Injection Threats Targeting Vector Databases",
                    "category": "cybersecurity",
                    "summary": "Security logs discover injection vulnerabilities bypassing vector database query parameters. Sandbox isolation recommended.",
                    "content": "New security reports outline database sanitisation criteria. Developers are urged to enforce input bounds checking on search inputs."
                },
                {
                    "title": "VC Funding Allocations Q2: Profit Over Pure Volume",
                    "category": "saas",
                    "summary": "Venture capital trends emphasize path-to-margins within 12 months rather than user scale burn models.",
                    "content": "Runway buffers must align with actual unit margins. Analysis shows micro-seed tickets prioritize positive cash flow capabilities."
                }
            ]
            for u in updates:
                db_u = models.TechUpdate(**u)
                db.add(db_u)
            db.commit()
            print("[SEED] Seeded default tech news updates feed.")

    finally:
        db.close()
