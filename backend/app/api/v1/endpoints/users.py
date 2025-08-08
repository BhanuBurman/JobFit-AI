from fastapi import APIRouter

router = APIRouter()

@router.get("/users/{user_id}")
async def get_user(user_id: int):
    """Get user by ID"""
    return {"user_id": user_id, "message": f"User {user_id} details"} 