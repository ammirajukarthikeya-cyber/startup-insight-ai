from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud, models, auth, ai

router = APIRouter(prefix="/api/mentor", tags=["AI Startup Mentor"])

@router.get("/history", response_model=list[schemas.ChatMessageResponse])
def get_chat_history(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    history = crud.get_chat_history(db, current_user.id)
    if not history:
        # Create an initial welcome message from the mentor if empty
        welcome = (
            "Hello! I am your 24/7 AI Startup Mentor. I can assist you with business planning, "
            "pitch preparation, finding marketing strategies, or understanding unit economics.\n\n"
            "What is the biggest operational hurdle you are facing with your idea right now?"
        )
        msg = crud.add_chat_message(db, current_user.id, sender="system", content=welcome)
        return [msg]
    return history


@router.post("/send", response_model=schemas.ChatMessageResponse)
def send_message(data: schemas.ChatMessageCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
        
    # Save user message
    crud.add_chat_message(db, current_user.id, sender="user", content=data.content)
    
    # Generate response
    reply_text = ai.get_ai_response(data.content)
    
    # Save system response
    sys_msg = crud.add_chat_message(db, current_user.id, sender="system", content=reply_text)
    
    return sys_msg

# Monkeypatch ai file to add simple response helper if not present
if not hasattr(ai, 'get_ai_response'):
    def simple_ai_response(query: str) -> str:
        text = query.lower()
        if "funding" in text or "pitch" in text or "deck" in text:
            return (
                "Here is my recommended **Pre-Seed Pitch Checklist** to present to investors:\n\n"
                "1. **Problem Statement:** Frame it through a massive customer friction point.\n"
                "2. **Secret Sauce Solution:** Focus on utility/speed multipliers rather than lines of code.\n"
                "3. **TAM Market Sizing:** Bottoms-up sizing (e.g. users * annual subscription).\n"
                "4. **Traction Indicators:** List signup waitlists or letters of intent.\n"
                "5. **The Ask:** e.g., 'Raising $500k to reach $15k MRR in 12 months with 2 engineers.'\n\n"
                "Do you have a specific funding target in mind?"
            )
        elif "hire" in text or "team" in text or "co-founder" in text:
            return (
                "Scaling team structures at pre-seed requires strict capital conservation:\n\n"
                "- **The 50/50 Rule:** Coordinate equity splits with co-founders early.\n"
                "- **Generalist Engineers:** Hire engineers who can manage database security and simple layouts.\n"
                "- **Vesting Schedule:** Use a 4-year vesting structure with a 1-year cliff.\n\n"
                "Are you building as a solo developer or seeking a commercial partner?"
            )
        elif "metrics" in text or "cac" in text or "ltv" in text or "churn" in text:
            return (
                "Key metrics early VCs search for in tech startups:\n\n"
                "- **LTV:CAC Ratio:** Target a ratio above 3:1 in your forecasts.\n"
                "- **SaaS Churn:** Retain users, keeping monthly churn under 4-5%.\n"
                "- **Gross Margins:** SaaS targets >80%; hardware/physical commerce targets >40%.\n\n"
                "What is your current average contract value or pricing expectation?"
            )
        else:
            return (
                "Good question! When launching a startup, your key priority is **Rapid Validation**.\n\n"
                "Instead of spending months building code, set up a simple landing page highlighting your solution, "
                "purchase $100 in target Google/LinkedIn search ads, and verify your conversion rate. "
                "If >10% register, you have validated consumer demand.\n\n"
                "What is your target audience or primary marketing channel?"
            )
    ai.get_ai_response = simple_ai_response
