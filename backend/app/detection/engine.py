from collections import deque
import time

class DrowsinessEngine:
    def __init__(self, ear_threshold=0.25, mar_threshold=0.5, perclos_window_sec=60):
        self.ear_threshold = ear_threshold
        self.mar_threshold = mar_threshold
        
        # PERCLOS computation: track frames where eyes are closed relative to total frames in window
        self.perclos_window_sec = perclos_window_sec
        self.history = deque(maxlen=900) # Assuming max 15 FPS * 60s
        
        self.blinks = 0
        self.yawns = 0
        self.eyes_closed_frames = 0
        self.state = "SAFE"
        
        # For blink detection state machine
        self.eye_state = "OPEN" # OPEN, CLOSING, CLOSED
        
        # Yawn detection
        self.is_yawning = False

    def reset_session(self):
        self.history.clear()
        self.blinks = 0
        self.yawns = 0
        self.state = "SAFE"
        self.eye_state = "OPEN"
        self.is_yawning = False

    def update(self, features):
        timestamp = time.time()
        ear = features["ear"]
        mar = features["mar"]
        
        # Track history for PERCLOS
        self.history.append({"ts": timestamp, "ear": ear, "closed": ear < self.ear_threshold})
        
        # Blink detection
        if ear < self.ear_threshold:
            if self.eye_state == "OPEN":
                self.eye_state = "CLOSING"
            elif self.eye_state == "CLOSING":
                self.eye_state = "CLOSED"
        else:
            if self.eye_state == "CLOSED":
                self.blinks += 1
            self.eye_state = "OPEN"
            
        # Yawn detection
        if mar > self.mar_threshold:
            if not self.is_yawning:
                self.is_yawning = True
                self.yawns += 1
        else:
            self.is_yawning = False
            
        # PERCLOS calculation
        cutoff = timestamp - self.perclos_window_sec
        valid_history = [x for x in self.history if x["ts"] > cutoff]
        if len(valid_history) > 0:
            closed_frames = sum([1 for x in valid_history if x["closed"]])
            perclos = closed_frames / len(valid_history)
        else:
            perclos = 0.0
            
        # Determine Status 
        score = 0
        reasons = []
        
        if perclos > 0.15: # 15% of the time eyes closed
            score += 40
            reasons.append("High PERCLOS")
        if perclos > 0.3:
            score += 40
            reasons.append("Critical PERCLOS")
            
        if self.eye_state == "CLOSED":
            # Check continuous closure
            recent_closed = sum([1 for x in list(self.history)[-10:] if x["closed"]])
            if recent_closed >= 10: # Around 1 second continuous
                score += 50
                reasons.append("Prolonged eye closure")
                
        if self.is_yawning or mar > self.mar_threshold:
            score += 20
            reasons.append("Yawning")
            
        # Cap score
        score = min(score, 100)
        
        if score >= 80:
            self.state = "CRITICAL"
        elif score >= 50:
            self.state = "DROWSY"
        elif score >= 20:
            self.state = "CAUTION"
        else:
            self.state = "SAFE"
            
        return {
            "state": self.state,
            "score": score,
            "confidence": 0.90, # Placeholder until ML adds confidence
            "severity": self.state,
            "reasons": reasons,
            "perclos": round(perclos, 3),
            "blinks": self.blinks,
            "yawns": self.yawns
        }
