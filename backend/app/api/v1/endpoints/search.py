from fastapi import APIRouter
from app.schemas.search import SearchResponse

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
async def search_items(query: str = "", limit: int = 10):
    """Search items with query parameters"""
    return SearchResponse(
        query=query,
        limit=limit,
        results=[f"Searching for '{query}' with limit {limit}"]
    ) 