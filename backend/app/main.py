from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

# Create FastAPI app instance
app = FastAPI(
    title="JobFit-AI API",
    description="A FastAPI application for JobFit-AI",
    version="1.0.0"
)

# Add CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to JobFit-AI API"}

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")

