from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.database import async_db  # Import the global instance

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Connect to Database
    await async_db.connect()
    
    yield
    
    # 2. Disconnect on shutdown
    await async_db.disconnect()

app = FastAPI(
    title="JobFit-AI API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to JobFit-AI API"}