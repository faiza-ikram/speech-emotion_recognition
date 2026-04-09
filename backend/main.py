import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine
from auth import router as auth_router
from predict import router as predict_router
from recordings import router as recordings_router

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def _run_migrations():
    """Add new columns to existing SQLite tables if needed."""
    from sqlalchemy import text
    if "sqlite" not in os.getenv("DATABASE_URL", "sqlite:///./anti_gravity.db"):
        return
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in result]
            if "google_id" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR"))
                conn.commit()
                print("✅ Added google_id column to users table.")
        except Exception as e:
            print(f"ℹ️  Migration skipped (table may not exist yet): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables and run migrations
    # (ML model loads lazily on first /predict call to avoid startup crash
    #  when TF/numpy aren't installed in this environment)
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    print("✅ Database tables created.")
    print("ℹ️  ML model will be loaded on first /predict request.")
    yield
    # Shutdown (nothing to clean up)


app = FastAPI(
    title="Speech Emotion Recognition API",
    description="Speech Emotion Recognition API with JWT auth and per-user audio history.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001,https://speech-emotion-recognition-ashen.vercel.app,https://anti-gravity-voice.vercel.app",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(recordings_router)

# ── Serve uploaded audio files statically ────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/", tags=["health"])
def root():
    return {
        "message": "Speech Emotion Recognition API is running 🚀",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
