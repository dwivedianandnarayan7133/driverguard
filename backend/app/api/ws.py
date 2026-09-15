from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
import base64
import numpy as np
import cv2
from datetime import datetime

from app.detection.vision import VisionEngine
from app.detection.engine import DrowsinessEngine
from app.ml.pipeline import MLPipeline
from app.database import SessionLocal
from app import models

router = APIRouter()
vision_engine = VisionEngine()
ml_pipeline = MLPipeline()

# In production, we'd map session_id to DrowsinessEngines
# Here we just demo a single connection per websocket
@router.websocket("/detection/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int):
    await websocket.accept()
    
    # Init detection engine for this session
    drowsiness_engine = DrowsinessEngine()
    db = SessionLocal()
    
    # Throttle DB writes
    last_db_write = datetime.utcnow()
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Expecting base64 image
            if "frame" in payload:
                frame_data = payload["frame"]
                # Decode base64 
                if "," in frame_data:
                    frame_data = frame_data.split(",")[1]
                
                img_bytes = base64.b64decode(frame_data)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                
                if img is None:
                    continue
                    
                status, features = vision_engine.extract_features(img)
                
                if status == "DETECTED" and features:
                    # Update state
                    result = drowsiness_engine.update(features)
                    
                    # Optional: override score/state with ML prediction if available
                    ml_state, drowsy_prob = ml_pipeline.predict(features)
                    if ml_state and drowsiness_engine.state != "CRITICAL": 
                        # ML augment
                        if ml_state == "DROWSY" and result["state"] == "SAFE":
                            result["state"] = "CAUTION"
                            result["confidence"] = round(drowsy_prob, 2)
                    
                    # Send response back
                    response = {
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "state": result["state"],
                        "drowsinessScore": result["score"],
                        "confidence": result["confidence"],
                        "ear": features["ear"],
                        "perclos": result["perclos"],
                        "blinkRate": result["blinks"], # Normally per min
                        "yawnCount": result["yawns"],
                        "faceDetected": True,
                        "reasons": result["reasons"]
                    }
                    await websocket.send_text(json.dumps(response))
                    
                    # Log event to DB every 5 seconds
                    now = datetime.utcnow()
                    if (now - last_db_write).total_seconds() > 5:
                        event = models.DetectionEvent(
                            session_id=session_id,
                            event_type=result["state"],
                            severity=result["severity"],
                            confidence=result["confidence"],
                            ear=features["ear"],
                            mar=features["mar"],
                            perclos=result["perclos"]
                        )
                        db.add(event)
                        db.commit()
                        last_db_write = now
                        
                else:
                    await websocket.send_text(json.dumps({
                        "faceDetected": False,
                        "status": status if status else "NO_FACE"
                    }))
    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")
    finally:
        db.close()
