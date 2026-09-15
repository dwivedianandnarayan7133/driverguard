from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="USER")
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, default=0) # seconds
    average_score = Column(Float, default=0.0)
    maximum_score = Column(Float, default=0.0)
    blink_count = Column(Integer, default=0)
    yawn_count = Column(Integer, default=0)
    alert_count = Column(Integer, default=0)
    safety_score = Column(Float, default=100.0)
    
    user = relationship("User", back_populates="sessions")
    events = relationship("DetectionEvent", back_populates="session")

class DetectionEvent(Base):
    __tablename__ = "detection_events"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String) # SAFE, CAUTION, DROWSY, CRITICAL
    severity = Column(String)
    confidence = Column(Float)
    ear = Column(Float)
    mar = Column(Float)
    perclos = Column(Float)
    
    session = relationship("Session", back_populates="events")

class MLModel(Base):
    __tablename__ = "ml_models"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    version = Column(String)
    algorithm = Column(String)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
