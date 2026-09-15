import sys
import os

# Add backend dir to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    # Check if exists
    user = db.query(User).filter(User.email == "admin@driveguard.ai").first()
    if not user:
        new_user = User(
            email="admin@driveguard.ai", 
            name="Admin User", 
            password_hash=get_password_hash("admin"), 
            role="ADMIN"
        )
        db.add(new_user)
        db.commit()
        print("Test user created!")
    else:
        print("User already exists!")
        
if __name__ == "__main__":
    seed()
