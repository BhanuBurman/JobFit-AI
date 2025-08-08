from fastapi import APIRouter
from app.schemas.item import ItemCreate

router = APIRouter()

@router.post("/items")
async def create_item(item: ItemCreate):
    """Create a new item"""
    return {"message": "Item created successfully", "item": item.item} 