from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "JobFit-AI"}

# Example endpoint with path parameter
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "message": f"User {user_id} details"}

# Example endpoint with query parameters
@app.get("/search")
async def search_items(query: str = "", limit: int = 10):
    return {
        "query": query,
        "limit": limit,
        "results": f"Searching for '{query}' with limit {limit}"
    }

# Example POST endpoint
@app.post("/items")
async def create_item(item: dict):
    return {"message": "Item created successfully", "item": item}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
