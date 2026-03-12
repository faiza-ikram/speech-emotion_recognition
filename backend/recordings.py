import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Recording, User

router = APIRouter(prefix="/recordings", tags=["recordings"])


class RecordingOut(BaseModel):
    id: int
    filename: str
    source: str
    emotion: Optional[str]
    confidence: Optional[float]
    probabilities: Optional[dict]
    duration: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[RecordingOut])
def list_recordings(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the authenticated user's recording history, newest first."""
    recordings = (
        db.query(Recording)
        .filter(Recording.user_id == current_user.id)
        .order_by(Recording.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for r in recordings:
        probs = json.loads(r.probabilities_json) if r.probabilities_json else None
        result.append(
            RecordingOut(
                id=r.id,
                filename=r.filename,
                source=r.source,
                emotion=r.emotion,
                confidence=r.confidence,
                probabilities=probs,
                duration=r.duration,
                created_at=r.created_at,
            )
        )
    return result


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregate stats for the dashboard."""
    recordings = db.query(Recording).filter(Recording.user_id == current_user.id).all()
    total = len(recordings)
    recorded = sum(1 for r in recordings if r.source == "recorded")
    uploaded = sum(1 for r in recordings if r.source == "uploaded")

    emotion_counts: dict = {}
    for r in recordings:
        if r.emotion:
            emotion_counts[r.emotion] = emotion_counts.get(r.emotion, 0) + 1

    dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else None

    return {
        "total": total,
        "recorded": recorded,
        "uploaded": uploaded,
        "emotion_counts": emotion_counts,
        "dominant_emotion": dominant_emotion,
    }


@router.delete("/{recording_id}", status_code=204)
def delete_recording(
    recording_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recording = (
        db.query(Recording)
        .filter(Recording.id == recording_id, Recording.user_id == current_user.id)
        .first()
    )
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    db.delete(recording)
    db.commit()
