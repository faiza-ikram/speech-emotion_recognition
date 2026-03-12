from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # null for Google OAuth users
    google_id = Column(String, unique=True, index=True, nullable=True)  # Google OAuth
    created_at = Column(DateTime, default=datetime.utcnow)

    recordings = relationship("Recording", back_populates="owner", cascade="all, delete")


class Recording(Base):
    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    source = Column(String, default="recorded")   # "recorded" | "uploaded"
    emotion = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    probabilities_json = Column(Text, nullable=True)  # JSON string
    duration = Column(Float, nullable=True)            # seconds
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="recordings")
