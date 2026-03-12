import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models import User

# ── Config ─────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretchangeme")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

bearer_scheme = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["auth"])


# ── Pydantic schemas ────────────────────────────────────────────────────────────
class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class GoogleTokenSchema(BaseModel):
    credential: str  # Google ID token


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    email: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Helpers ─────────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Routes ──────────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
        google_id=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.google_id:
        raise HTTPException(status_code=400, detail="Please sign in with Google")
    if not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Google OAuth ───────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


def verify_google_token(credential: str) -> dict | None:
    """Verify Google ID token and return payload. Returns None if invalid."""
    if not GOOGLE_CLIENT_ID:
        return None
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
        return payload
    except Exception:
        return None


@router.post("/google", response_model=TokenResponse)
def google_login(body: GoogleTokenSchema, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google Sign-In is not configured. Set GOOGLE_CLIENT_ID.",
        )
    payload = verify_google_token(body.credential)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("name") or payload.get("email", "").split("@")[0]

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Invalid Google token payload")

    # Find or create user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link existing email account to Google
            user.google_id = google_id
            db.commit()
            db.refresh(user)
        else:
            # Create new user - ensure unique username
            base_username = "".join(c for c in name if c.isalnum() or c in "._")[:20] or "user"
            username = base_username
            n = 0
            while db.query(User).filter(User.username == username).first():
                n += 1
                username = f"{base_username}{n}"
            user = User(
                username=username,
                email=email,
                hashed_password="",  # Empty for OAuth; compatible with NOT NULL columns
                google_id=google_id,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        username=user.username,
        email=user.email,
    )
