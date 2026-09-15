import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

class MLPipeline:
    def __init__(self, model_path="ml/models/drowsiness_rf.pkl"):
        self.model_path = model_path
        self.model = None
        self.metrics = None
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except:
                self.model = None
                
    def predict(self, features):
        if not self.model:
            return None, 0.0 # Model unavailable
        
        # Expect features dict like: {"ear": 0.25, "mar": 0.3, "perclos": 0.1, "blinks_per_min": 15}
        try:
            X = pd.DataFrame([{
                'ear': features.get('ear', 0.25),
                'mar': features.get('mar', 0.3),
                'perclos': features.get('perclos', 0.0)
            }])
            
            prob = self.model.predict_proba(X)[0]
            # Assume class 1 is DROWSY
            drowsy_prob = prob[1]
            return "DROWSY" if drowsy_prob > 0.5 else "SAFE", drowsy_prob
        except:
            return None, 0.0

    def generate_dummy_dataset(self, num_samples=1000):
        # Generate synthetic data
        np.random.seed(42)
        
        # Safe class
        n_safe = int(num_samples * 0.7)
        safe_ear = np.random.normal(0.30, 0.03, n_safe)
        safe_mar = np.random.normal(0.4, 0.1, n_safe)
        safe_perclos = np.random.normal(0.05, 0.02, n_safe)
        safe_labels = np.zeros(n_safe)
        
        # Drowsy class
        n_drowsy = num_samples - n_safe
        drowsy_ear = np.random.normal(0.18, 0.04, n_drowsy)
        drowsy_mar = np.random.normal(0.7, 0.15, n_drowsy)
        drowsy_perclos = np.random.normal(0.25, 0.08, n_drowsy)
        drowsy_labels = np.ones(n_drowsy)
        
        df = pd.DataFrame({
            'ear': np.concatenate([safe_ear, drowsy_ear]),
            'mar': np.concatenate([safe_mar, drowsy_mar]),
            'perclos': np.concatenate([safe_perclos, drowsy_perclos]),
            'label': np.concatenate([safe_labels, drowsy_labels])
        })
        
        return df
        
    def train(self, df=None):
        if df is None:
            df = self.generate_dummy_dataset()
            
        X = df[['ear', 'mar', 'perclos']]
        y = df['label']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        rf.fit(X_train, y_train)
        
        preds = rf.predict(X_test)
        
        self.metrics = {
            "accuracy": round(accuracy_score(y_test, preds), 4),
            "precision": round(precision_score(y_test, preds), 4),
            "recall": round(recall_score(y_test, preds), 4),
            "f1": round(f1_score(y_test, preds), 4),
            "dataset_size": len(df)
        }
        
        self.model = rf
        
        # Ensure dir exists
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        
        return self.metrics
