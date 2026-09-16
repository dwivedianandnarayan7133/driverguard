import sys
import os

# Add backend directory to sys.path so app imports work seamlessly from root
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    print(f"Starting DriveGuard Server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
