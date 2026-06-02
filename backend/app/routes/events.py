from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud, models, auth

router = APIRouter(prefix="/api/events", tags=["Startup Events Hub"])

@router.get("", response_model=list[schemas.StartupEventResponse])
def list_events(db: Session = Depends(get_db)):
    return crud.get_events(db)


@router.post("/bookmark", response_model=schemas.EventBookmarkCreate)
def bookmark_event(data: schemas.EventBookmarkCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    event = db.query(models.StartupEvent).filter(models.StartupEvent.id == data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Startup Event not found")
        
    crud.add_bookmark(db, current_user.id, data.event_id)
    return data


@router.post("/unbookmark")
def unbookmark_event(data: schemas.EventBookmarkCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    success = crud.remove_bookmark(db, current_user.id, data.event_id)
    if not success:
        raise HTTPException(status_code=400, detail="Event was not bookmarked")
    return {"message": "Bookmark removed successfully"}


@router.get("/bookmarked", response_model=list[schemas.StartupEventResponse])
def get_bookmarked_events(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    bookmarks = db.query(models.EventBookmark).filter(
        models.EventBookmark.user_id == current_user.id
    ).all()
    
    return [b.event for b in bookmarks]


@router.post("/register/{event_id}")
def register_to_event(event_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    event = db.query(models.StartupEvent).filter(models.StartupEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Log audit entry representing a booking
    crud.create_audit_log(
        db, 
        action=f"registered_event_id_{event_id}_title_{event.title[:20]}", 
        user_id=current_user.id
    )
    
    # Return mock ticket confirmation details
    ticket_id = f"TCK-{event_id}-{random_digits()}"
    return {
        "message": f"Successfully registered for {event.title}!",
        "ticket_id": ticket_id,
        "date": event.date,
        "location": event.location
    }

def random_digits():
    import random
    return "".join(random.choices("0123456789", k=6))
