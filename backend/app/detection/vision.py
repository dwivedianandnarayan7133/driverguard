import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh

# Landmark indices for computations
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
MOUTH = [78, 81, 13, 311, 308, 402, 14, 178] # Inner/outer lips

class VisionEngine:
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def calculate_ear(self, landmarks, eye_indices):
        # EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
        p1, p2, p3, p4, p5, p6 = [landmarks[i] for i in eye_indices]
        
        # Euclidean distances
        def dist(p_a, p_b):
            return math.hypot(p_a.x - p_b.x, p_a.y - p_b.y)
            
        v1 = dist(p2, p6)
        v2 = dist(p3, p5)
        h = dist(p1, p4)
        
        if h == 0: return 0.0
        ear = (v1 + v2) / (2.0 * h)
        return ear
        
    def calculate_mar(self, landmarks):
        # Mouth aspect ratio
        p1, p2, p3, p4, p5, p6, p7, p8 = [landmarks[i] for i in MOUTH]
        def dist(p_a, p_b):
            return math.hypot(p_a.x - p_b.x, p_a.y - p_b.y)
            
        v_inner = dist(p3, p7)
        h = dist(p1, p5)
        if h == 0: return 0.0
        return v_inner / h

    def extract_features(self, image_np):
        rgb_frame = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return None, None
            
        if len(results.multi_face_landmarks) > 1:
            return "MULTIPLE_FACES", None
            
        face_landmarks = results.multi_face_landmarks[0]
        landmarks = face_landmarks.landmark
        
        left_ear = self.calculate_ear(landmarks, LEFT_EYE)
        right_ear = self.calculate_ear(landmarks, RIGHT_EYE)
        avg_ear = (left_ear + right_ear) / 2.0
        
        mar = self.calculate_mar(landmarks)
        
        # Placeholder for pose (simplified)
        nose = landmarks[1]
        pose = {"pitch": 0.0, "yaw": 0.0, "roll": 0.0} # TODO full PnP if needed
        
        features = {
            "ear": round(avg_ear, 3),
            "mar": round(mar, 3),
            "pose": pose
        }
        
        return "DETECTED", features
