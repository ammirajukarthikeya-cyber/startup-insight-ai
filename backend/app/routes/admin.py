from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app import schemas, crud, models, auth

router = APIRouter(prefix="/api/admin", tags=["Administrative Portal"])

# All routes in this router require get_current_admin_user
@router.get("/metrics", response_model=schemas.AdminSummaryMetrics)
def get_admin_metrics(admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    
    # Calculate sum of revenue
    revenue_sum = db.query(models.Transaction).filter(
        models.Transaction.status == "Success"
    ).all()
    total_rev = sum(tx.amount for tx in revenue_sum)
    
    total_analyses = db.query(models.IdeaAnalysis).count()
    
    # Simple event registration proxy count based on audit logs
    total_registrations = db.query(models.AuditLog).filter(
        models.AuditLog.action.like("registered_event%")
    ).count()
    
    recent_transactions = db.query(models.Transaction).order_by(
        models.Transaction.timestamp.desc()
    ).limit(10).all()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_revenue": total_rev,
        "total_analyses": total_analyses,
        "total_registrations": total_registrations,
        "recent_transactions": recent_transactions
    }


@router.get("/users")
def list_users(admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "subscription_tier": u.subscription_tier,
            "subscription_status": u.subscription_status,
            "created_at": u.created_at
        }
        for u in users
    ]


@router.post("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Administrators cannot suspend themselves")
        
    user.is_active = not user.is_active
    db.commit()
    
    action = "suspended_user" if not user.is_active else "activated_user"
    crud.create_audit_log(db, action=f"{action}_id_{user_id}", user_id=admin.id)
    
    return {"message": f"User status updated. Active: {user.is_active}"}


@router.post("/users/{user_id}/role")
def modify_user_role(user_id: int, role: str, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role type")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = role
    db.commit()
    
    crud.create_audit_log(db, action=f"changed_role_to_{role}_user_{user_id}", user_id=admin.id)
    return {"message": f"User role updated to {role}"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Administrators cannot delete themselves")
        
    db.delete(user)
    db.commit()
    
    crud.create_audit_log(db, action=f"deleted_user_id_{user_id}", user_id=admin.id)
    return {"message": "User deleted successfully"}


@router.post("/plans", response_model=schemas.SubscriptionPlanResponse)
def create_subscription_plan(plan: schemas.SubscriptionPlanCreate, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    existing = crud.get_plan_by_name(db, plan.name)
    if existing:
        raise HTTPException(status_code=400, detail="Plan name already exists")
    db_plan = crud.create_plan(db, plan)
    
    crud.create_audit_log(db, action=f"created_plan_{plan.name}", user_id=admin.id)
    return db_plan


@router.put("/plans/{plan_id}", response_model=schemas.SubscriptionPlanResponse)
def modify_subscription_plan(plan_id: int, plan_update: schemas.SubscriptionPlanUpdate, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    db_plan = crud.update_plan(db, plan_id, plan_update)
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    crud.create_audit_log(db, action=f"modified_plan_id_{plan_id}", user_id=admin.id)
    return db_plan


@router.delete("/plans/{plan_id}")
def delete_subscription_plan(plan_id: int, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    success = crud.delete_plan(db, plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    crud.create_audit_log(db, action=f"deleted_plan_id_{plan_id}", user_id=admin.id)
    return {"message": "Plan deleted successfully"}


@router.post("/coupons", response_model=schemas.CouponResponse)
def create_discount_coupon(coupon: schemas.CouponCreate, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    existing = db.query(models.Coupon).filter(models.Coupon.code == coupon.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    db_coupon = crud.create_coupon(db, coupon)
    
    crud.create_audit_log(db, action=f"created_coupon_{coupon.code}", user_id=admin.id)
    return db_coupon


@router.post("/events", response_model=schemas.StartupEventResponse)
def add_startup_event(event: schemas.StartupEventCreate, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    db_event = crud.create_event(db, event)
    crud.create_audit_log(db, action=f"created_event_{event.title[:20]}", user_id=admin.id)
    return db_event


@router.delete("/events/{event_id}")
def delete_startup_event(event_id: int, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    success = crud.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    crud.create_audit_log(db, action=f"deleted_event_id_{event_id}", user_id=admin.id)
    return {"message": "Event deleted successfully"}


@router.post("/news", response_model=schemas.TechUpdateResponse)
def add_tech_news(news: schemas.TechUpdateCreate, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    db_news = crud.create_tech_update(db, news)
    crud.create_audit_log(db, action=f"created_news_{news.title[:20]}", user_id=admin.id)
    return db_news


@router.delete("/news/{news_id}")
def delete_tech_news(news_id: int, admin: models.User = Depends(auth.get_current_admin_user), db: Session = Depends(get_db)):
    success = crud.delete_tech_update(db, news_id)
    if not success:
        raise HTTPException(status_code=404, detail="News post not found")
    crud.create_audit_log(db, action=f"deleted_news_id_{news_id}", user_id=admin.id)
    return {"message": "News article deleted successfully"}
