from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud, models, auth, ai
import json

router = APIRouter(prefix="/api/analyzer", tags=["Idea Analyzer"])

@router.post("/run", response_model=schemas.IdeaAnalysisResponse)
def run_analysis(data: schemas.IdeaAnalysisCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Limit check based on subscription tier if needed:
    # Free tier might be allowed e.g. 2 scans, Pro unlimited, etc.
    # For user ease, we support limits checking.
    if current_user.subscription_tier == "Free":
        previous_scans = db.query(models.IdeaAnalysis).filter(
            models.IdeaAnalysis.user_id == current_user.id
        ).count()
        if previous_scans >= 2:
            raise HTTPException(
                status_code=403, 
                detail="Free Tier scan limit reached (2 scans). Please upgrade to Pro for unlimited analyses."
            )
            
    # Execute AI prompt engine pipeline
    results = ai.run_ai_idea_analysis(
        name=data.name or "Untitled Idea",
        industry=data.industry,
        target_market=data.target_market,
        pitch_text=data.pitch_text
    )
    
    # Structure database row matching schema
    db_analysis = models.IdeaAnalysis(
        user_id=current_user.id,
        name=data.name or "Concept Screen",
        industry=data.industry,
        target_market=data.target_market,
        pitch_text=data.pitch_text,
        feasibility_score=results["feasibility_score"],
        market_score=results["market_score"],
        risk_score=results["risk_score"],
        funding_score=results["funding_score"],
        health_score=results["health_score"],
        swot_json=results["swot_json"],
        competitors_json=results["competitors_json"],
        vulnerabilities_json=results["vulnerabilities_json"],
        recommendation=results["recommendation"]
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    # Create audit log
    crud.create_audit_log(
        db, 
        action=f"run_analysis_id_{db_analysis.id}_score_{db_analysis.feasibility_score}", 
        user_id=current_user.id
    )
    
    return db_analysis


@router.get("/competitors")
def get_competitors(industry: str, query: str = "", current_user: models.User = Depends(auth.get_current_user)):
    # Standard competitor fetching endpoint
    comps = ai.get_industry_competitors(industry, query.lower())
    return comps


@router.get("/risks")
def get_vulnerabilities(industry: str, risk_score: int = 50, current_user: models.User = Depends(auth.get_current_user)):
    vulnerabilities = ai.get_industry_vulnerabilities(industry, risk_score)
    return vulnerabilities
