"""
FastAPI main application entry point
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import models to ensure they are registered with SQLAlchemy
from app.models import *  # This ensures all models are imported
from app.api.auth import router as auth_router
from app.api.protected_example import router as protected_router

app = FastAPI(
    title="Expense Tracking API",
    description="API for personal expense tracking with OCR processing",
    version="1.0.0"
)

# Configure CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(protected_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Expense Tracking API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
