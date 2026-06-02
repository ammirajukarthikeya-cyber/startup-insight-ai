from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.database import get_db
from app import schemas, crud, models, auth

router = APIRouter(prefix="/api/user", tags=["User Profiles"])

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.get("/analyses", response_model=List[schemas.IdeaAnalysisResponse])
def get_analyses(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.get_user_analyses(db, current_user.id)


@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).filter(
        models.AuditLog.user_id == current_user.id
    ).order_by(models.AuditLog.timestamp.desc()).limit(50).all()
    return logs


@router.get("/active-sessions")
def get_active_sessions(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(models.UserSession).filter(
        models.UserSession.user_id == current_user.id,
        models.UserSession.is_valid == True
    ).order_by(models.UserSession.login_time.desc()).all()
    
    return [
        {
            "id": s.id,
            "device_info": s.device_info,
            "ip_address": s.ip_address,
            "login_time": s.login_time,
            "last_active": s.last_active,
            "is_current": s.token == auth.oauth2_scheme
        }
        for s in sessions
    ]


@router.post("/terminate-session/{session_id}")
def terminate_session(session_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    session = db.query(models.UserSession).filter(
        models.UserSession.id == session_id,
        models.UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.is_valid = False
    db.commit()
    
    crud.create_audit_log(
        db, 
        action=f"session_terminated_id_{session_id}", 
        user_id=current_user.id
    )
    return {"message": "Session terminated successfully"}
