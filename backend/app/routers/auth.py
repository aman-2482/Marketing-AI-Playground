import hashlib
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserToken
from app.schemas import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"pbkdf2_sha256${salt}${key.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        _, salt, key_hex = stored_hash.split("$")
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


def _create_token(user_id: int, db: Session) -> str:
    token_value = secrets.token_urlsafe(32)
    db.add(UserToken(user_id=user_id, token=token_value))
    db.commit()
    return token_value


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if not _EMAIL_RE.match(data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=_hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _create_token(user.id, db)
    return AuthResponse(
        token=token, 
        username=user.username, 
        email=user.email, 
        user_id=user.id,
        trial_minutes=user.trial_minutes,
        trial_seconds_used=user.trial_seconds_used
    )


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not _verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Active screen time trial check (allow admin to bypass)
    if user.username != "admin":
        if user.trial_seconds_used >= (user.trial_minutes * 60):
            raise HTTPException(status_code=403, detail="TRIAL_EXPIRED")

    token = _create_token(user.id, db)
    return AuthResponse(
        token=token, 
        username=user.username, 
        email=user.email, 
        user_id=user.id,
        trial_minutes=user.trial_minutes,
        trial_seconds_used=user.trial_seconds_used
    )


def get_current_user(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> User:
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_token = db.query(UserToken).filter(UserToken.token == token).first()
    if not user_token:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_token.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Active screen time trial check (allow admin to bypass)
    if user.username != "admin":
        if user.trial_seconds_used >= (user.trial_minutes * 60):
            raise HTTPException(status_code=403, detail="TRIAL_EXPIRED")

    return user


@router.get("/me", response_model=AuthResponse)
def me(authorization: str = Header(default=""), db: Session = Depends(get_db)):
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_token = db.query(UserToken).filter(UserToken.token == token).first()
    if not user_token:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_token.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return AuthResponse(
        token=token, 
        username=user.username, 
        email=user.email, 
        user_id=user.id,
        trial_minutes=user.trial_minutes,
        trial_seconds_used=user.trial_seconds_used
    )

from pydantic import BaseModel

class PingRequest(BaseModel):
    seconds: int

@router.post("/ping")
def ping(data: PingRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.username == "admin":
        return {"status": "ok", "trial_seconds_used": user.trial_seconds_used}
        
    user.trial_seconds_used += data.seconds
    db.commit()
    
    expired = user.trial_seconds_used >= (user.trial_minutes * 60)
    return {"status": "ok", "trial_seconds_used": user.trial_seconds_used, "expired": expired}
