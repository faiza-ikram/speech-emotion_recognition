import json
import os
import tempfile
import uuid
import warnings
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Recording, User

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

router = APIRouter(tags=["predict"])


# ── Paths ───────────────────────────────────────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BACKEND_DIR, "best_model.keras")
SCALER_PATH = os.path.join(BACKEND_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(BACKEND_DIR, "encoder.pkl")
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# ── Lazy-loaded globals ─────────────────────────────────────────────────────────
_model = None
_scaler = None
_encoder = None


def load_artifacts():
    global _model, _scaler, _encoder
    if _model is None:
        import pickle
        try:
            import keras
            _model = keras.models.load_model(MODEL_PATH)
        except Exception:
            import tensorflow as tf
            _model = tf.keras.models.load_model(MODEL_PATH)
        with open(SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)
        with open(ENCODER_PATH, "rb") as f:
            _encoder = pickle.load(f)
    return _model, _scaler, _encoder


# ── Feature extraction ──────────────────────────────────────────────────────────
def extract_features(audio_bytes: bytes, sample_rate: int = 22050):
    """Extracts 162 features matching training pipeline."""
    import numpy as np
    import librosa
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        y, sr = librosa.load(tmp_path, sr=sample_rate, duration=2.5, offset=0.6)
        y = librosa.util.normalize(y)

        result = np.array([])

        # 1. ZCR
        zcr = np.mean(librosa.feature.zero_crossing_rate(y=y).T, axis=0)
        result = np.hstack((result, zcr))
        # 2. Chroma
        stft = np.abs(librosa.stft(y))
        chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sr).T, axis=0)
        result = np.hstack((result, chroma))
        # 3. MFCC
        mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr).T, axis=0)
        result = np.hstack((result, mfcc))
        # 4. RMS
        rms = np.mean(librosa.feature.rms(y=y).T, axis=0)
        result = np.hstack((result, rms))
        # 5. Mel Spectrogram
        mel = np.mean(librosa.feature.melspectrogram(y=y, sr=sr).T, axis=0)
        result = np.hstack((result, mel))

        return result.reshape(1, -1)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def get_audio_duration(audio_bytes: bytes) -> float:
    """Returns duration in seconds."""
    import librosa
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    try:
        return float(librosa.get_duration(path=tmp_path))
    except Exception:
        return 0.0
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ── Route ───────────────────────────────────────────────────────────────────────
ALLOWED_TYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/mpeg", "audio/ogg", "audio/webm",
    "application/octet-stream",
}


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    source: str = "uploaded",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept a WAV/MP3/WebM audio file, run emotion analysis, persist to DB.
    Returns: { emotion, confidence, probabilities, recording_id }
    """
    model, scaler, encoder = load_artifacts()

    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # ── Predict ──────────────────────────────────────────────────────────
        features = extract_features(audio_bytes)
        features_scaled = scaler.transform(features)
        features_reshaped = features_scaled.reshape(
            features_scaled.shape[0], features_scaled.shape[1], 1
        )
        probs = model.predict(features_reshaped, verbose=0)[0]

        if hasattr(encoder, "categories_"):
            labels = encoder.categories_[0].tolist()
        else:
            labels = encoder.classes_.tolist()

        top_idx = int(__import__('numpy').argmax(probs))
        emotion = str(labels[top_idx])
        confidence = float(probs[top_idx])
        probabilities = {str(labels[i]): round(float(probs[i]), 4) for i in range(len(labels))}

        # ── Save file ────────────────────────────────────────────────────────
        ext = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(UPLOADS_DIR, unique_name)
        with open(save_path, "wb") as f:
            f.write(audio_bytes)

        duration = get_audio_duration(audio_bytes)

        # ── Persist to DB ────────────────────────────────────────────────────
        recording = Recording(
            user_id=current_user.id,
            filename=file.filename or unique_name,
            storage_path=save_path,
            source=source,
            emotion=emotion,
            confidence=round(confidence, 4),
            probabilities_json=json.dumps(probabilities),
            duration=round(duration, 2),
        )
        db.add(recording)
        db.commit()
        db.refresh(recording)

        return JSONResponse({
            "emotion": emotion,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "recording_id": recording.id,
            "duration": round(duration, 2),
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
