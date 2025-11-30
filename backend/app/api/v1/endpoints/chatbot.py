from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.schemas.query import QueryRequest, QueryResponse
from app.schemas.user import User
from app.services import chatbot_service
from app.services.auth_service import get_current_user
from app.services.llm_service import OPENAIService

router = APIRouter()
service = chatbot_service.ChatBotService()

class ChatRequest(BaseModel):
    thread_id: str
    message: str


class ChatResponse(BaseModel):
    thread_id: str
    response: str


@router.post("/chat", response_model=ChatResponse)
async def query(
    request: ChatRequest,
    # This ensures the token is valid AND gives you the user object
    current_user: User = Depends(get_current_user)
) -> ChatResponse:
    """Handle query requests"""
    try:
        user_id = current_user.id
        # Use the service to process the query
        result = await service.generate_response(user_id, request.thread_id, request.message)

        # Return the processed result
        return ChatResponse(thread_id=str(request.thread_id), response=result)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors that might occur during processing
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")
    
@router.get("/chat/history/{thread_id}", response_model=list[dict])
async def get_chat_history(
    thread_id: int,
    current_user: User = Depends(get_current_user)
) -> list[dict]:
    """Retrieve chat history for a given thread."""
    try:
        user_id = current_user.id
        # The service now returns a list of dicts: [{'role': 'human', ...}, ...]
        messages = await service.get_chat_history(user_id, str(thread_id))
        
        # FIX 2: Return messages directly. Do NOT call .dict()
        return messages 

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")
