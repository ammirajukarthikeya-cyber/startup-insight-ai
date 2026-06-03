from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import uuid
from app.database import get_db
from app import schemas, crud, models, auth

router = APIRouter(prefix="/api/billing", tags=["Billing & Subscription Management"])

@router.get("/plans", response_model=list[schemas.SubscriptionPlanResponse])
def get_plans(db: Session = Depends(get_db)):
    return crud.get_plans(db)


@router.post("/checkout")
def create_checkout_session(data: schemas.CheckoutSessionCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    plan = crud.get_plan(db, data.plan_id)
    if not plan or not plan.is_enabled:
        raise HTTPException(status_code=404, detail="Plan not found or disabled")
        
    price = plan.monthly_price if data.billing_cycle == "monthly" else plan.yearly_price
    discount = 0.0
    
    # Check coupon
    if data.coupon_code:
        coupon = crud.get_coupon(db, data.coupon_code)
        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid discount coupon code")
        if coupon.expires_at and coupon.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Coupon code has expired")
        if coupon.max_redemptions and coupon.redemptions_count >= coupon.max_redemptions:
            raise HTTPException(status_code=400, detail="Coupon code redemption limit reached")
            
        discount = price * (coupon.discount_percent / 100.0)
        
    final_amount = max(0.0, price - discount)
    
    # Generate unique checkout token tracking this transaction
    checkout_token = f"chk_{uuid.uuid4().hex}"
    
    # Print mock details to backend console
    print(f"==================================================")
    print(f"[DEVELOPER NOTICE] Checkout initiated for: {current_user.email}")
    print(f"[DEVELOPER NOTICE] Plan: {plan.name} ({data.billing_cycle})")
    print(f"[DEVELOPER NOTICE] Original Price: INR {price}, Discount: INR {discount}")
    print(f"[DEVELOPER NOTICE] Final Amount: INR {final_amount}")
    print(f"[DEVELOPER NOTICE] Sandbox Checkout Token: {checkout_token}")
    print(f"==================================================")
    
    return {
        "checkout_token": checkout_token,
        "plan_name": plan.name,
        "amount": final_amount,
        "currency": "INR",
        "coupon_applied": data.coupon_code is not None,
        "discount_amount": discount
    }


@router.post("/simulate-payment")
def simulate_payment(data: schemas.CheckoutSimulatePayment, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Standard Sandbox Verification flow: check if token represents a simulated checkout
    # We will look up a random plan or update to Pro for simulation.
    # In sandbox mode, the client passes token details.
    
    # Find matching subscription tier based on token info. For ease, we grant Pro if not specified.
    tier = "Pro"
    amount = 999.0
    plan_name = "Pro Plan"
    
    plan = db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.name == "Pro Plan").first()
    if not plan:
        # Fallback to first available plan in db
        plan = db.query(models.SubscriptionPlan).first()
        if plan:
            tier = plan.name
            amount = plan.monthly_price
        else:
            # Emergency default
            tier = "Pro"
            amount = 999.0
            
    if data.status == "success":
        invoice = f"INV-{random.randint(100000, 999999)}"
        tx_id = data.gateway_payment_id or f"pay_{uuid.uuid4().hex[:12]}"
        
        # Update user profile
        current_user.subscription_tier = tier
        current_user.subscription_status = "active"
        # Grant 30 days or 365 days based on subscription simulation
        current_user.subscription_ends_at = datetime.utcnow() + timedelta(days=30)
        
        # Log transaction
        tx = models.Transaction(
            user_id=current_user.id,
            plan_id=plan.id if plan else 1,
            amount=amount,
            currency="INR",
            status="Success",
            payment_gateway="Sandbox Simulator",
            gateway_payment_id=tx_id,
            invoice_id=invoice
        )
        db.add(tx)
        db.commit()
        
        crud.create_audit_log(
            db, 
            action=f"payment_success_tier_{tier}_invoice_{invoice}", 
            user_id=current_user.id
        )
        
        return {
            "status": "success",
            "message": f"Payment verified! Subscribed to {tier} tier.",
            "invoice_id": invoice,
            "subscription_ends_at": current_user.subscription_ends_at
        }
    else:
        # Log failed transaction
        tx = models.Transaction(
            user_id=current_user.id,
            plan_id=plan.id if plan else 1,
            amount=amount,
            currency="INR",
            status="Failed",
            payment_gateway="Sandbox Simulator",
            gateway_payment_id="failed_simulation"
        )
        db.add(tx)
        db.commit()
        
        crud.create_audit_log(
            db, 
            action="payment_failed_simulation", 
            user_id=current_user.id
        )
        
        raise HTTPException(status_code=400, detail="Simulated transaction verification failed")


@router.post("/cancel")
def cancel_subscription(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.subscription_tier == "Free":
        raise HTTPException(status_code=400, detail="No active paid subscription found to cancel")
        
    current_user.subscription_status = "cancelled"
    db.commit()
    
    crud.create_audit_log(
        db, 
        action=f"subscription_cancelled_tier_{current_user.subscription_tier}", 
        user_id=current_user.id
    )
    return {
        "message": "Subscription cancelled. Access will terminate at your billing cycle end date.",
        "ends_at": current_user.subscription_ends_at
    }


@router.post("/coupons/validate")
def validate_coupon(code: str, db: Session = Depends(get_db)):
    coupon = crud.get_coupon(db, code)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon code not found or inactive")
        
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Coupon code has expired")
        
    if coupon.max_redemptions and coupon.redemptions_count >= coupon.max_redemptions:
        raise HTTPException(status_code=400, detail="Redemption limit reached for this coupon")
        
    return {
        "code": coupon.code,
        "discount_percent": coupon.discount_percent,
        "message": f"Coupon valid! Applies a {coupon.discount_percent}% discount."
    }


@router.get("/transactions", response_model=list[schemas.TransactionResponse])
def get_transaction_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.timestamp.desc()).all()
    return txs


@router.post("/submit-manual-payment")
def submit_manual_payment(data: schemas.ManualPaymentSubmit, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    plan = crud.get_plan(db, data.plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
        
    # Check if a pending transaction already exists
    existing = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.status == "Pending",
        models.Transaction.plan_id == plan.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending verification request for this plan.")
        
    # Log transaction as Pending
    tx = models.Transaction(
        user_id=current_user.id,
        plan_id=plan.id,
        amount=data.amount,
        currency="INR",
        status="Pending",
        payment_gateway=data.payment_method,
        gateway_payment_id=data.utr_number, # UPI ref number
        invoice_id=f"PEND-{random.randint(100000, 999999)}"
    )
    db.add(tx)
    db.commit()
    
    crud.create_audit_log(
        db, 
        action=f"manual_payment_submitted_plan_{plan.name}_utr_{data.utr_number}", 
        user_id=current_user.id
    )
    return {
        "status": "pending",
        "message": "Payment reference submitted successfully! Admin will verify and activate your subscription shortly."
    }


@router.get("/payment-settings", response_model=schemas.PaymentSettingResponse)
def get_payment_settings(db: Session = Depends(get_db)):
    settings = db.query(models.PaymentSetting).first()
    if not settings:
        settings = models.PaymentSetting(
            upi_id="ammirajukarthikeya@okaxis",
            bank_name="State Bank of India",
            account_holder="Ammiraju Karthikeya",
            account_number="1234567890",
            ifsc_code="SBIN0001234"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

