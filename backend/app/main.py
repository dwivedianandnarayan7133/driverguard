from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.api import auth, ml, sessions, ws

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("DriveGuard AI Backend Starting...")
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic
    print("DriveGuard AI Backend Shutting down...")

app = FastAPI(
    title="DriveGuard AI",
    description="Backend API for Driver Drowsiness Detection System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(ws.router, prefix="/ws", tags=["websocket"])

@app.get("/")
def read_root():
    return {"message": "Welcome to DriveGuard AI API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
