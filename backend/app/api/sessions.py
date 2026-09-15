from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app import models, schemas
from datetime import datetime

router = APIRouter()

@router.post("/start")
def start_session(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = models.Session(user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"message": "Session started", "session_id": session.id}

@router.post("/{session_id}/end")
def end_session(session_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id, models.Session.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.end_time = datetime.utcnow()
    # Compute duration
    dt = session.end_time - session.start_time
    session.duration = int(dt.total_seconds())
    
    # Optional logic: save average score from events to DB using aggregation
    # ...
    
    db.commit()
    return {"message": "Session ended", "duration": session.duration}

@router.get("/")
def get_sessions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Admin can see all, user sees own
    if current_user.role == "ADMIN":
        sessions = db.query(models.Session).all()
    else:
        sessions = db.query(models.Session).filter(models.Session.user_id == current_user.id).all()
    return sessions
