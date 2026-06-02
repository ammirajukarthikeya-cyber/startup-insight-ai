from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
import bcrypt
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app import crud, models

# Password hashing utilities
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# JWT helper utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# Dependency to fetch the current authenticated user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    # Check session validity
    session = db.query(models.UserSession).filter(
        models.UserSession.token == token,
        models.UserSession.is_valid == True
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or been terminated"
        )
        
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    # Check if subscription ends
    if user.subscription_ends_at and user.subscription_ends_at < datetime.utcnow():
        user.subscription_tier = "Free"
        user.subscription_status = "inactive"
        db.commit()

    # Update session activity
    session.last_active = datetime.utcnow()
    db.commit()
    
    return user

# Dependency to restrict endpoints to administrators
def get_current_admin_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user
