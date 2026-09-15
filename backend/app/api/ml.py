from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app import models
from app.ml.pipeline import MLPipeline

router = APIRouter()
ml_pipeline = MLPipeline()

@router.post("/train")
def train_model(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    metrics = ml_pipeline.train()
    
    # Save to db
    db_model = models.MLModel(
        name="Random Forest",
        version="1.0",
        algorithm="RandomForestClassifier",
        accuracy=metrics["accuracy"],
        precision=metrics["precision"],
        recall=metrics["recall"],
        f1_score=metrics["f1"],
        is_active=True
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    return {"message": "Model trained successfully", "metrics": metrics, "model": db_model}

@router.get("/status")
def get_model_status():
    if not ml_pipeline.model:
        return {"status": "UNAVAILABLE", "message": "No trained model available. Train or upload a model to enable ML inference."}
    
    return {"status": "AVAILABLE", "metrics": ml_pipeline.metrics}
