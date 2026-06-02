from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/api/news", tags=["Tech Updates Center"])

@router.get("", response_model=list[schemas.TechUpdateResponse])
def list_news(db: Session = Depends(get_db)):
    return crud.get_tech_updates(db)
