from fastapi import APIRouter, HTTPException
from app.schemas.query import QueryRequest, QueryResponse
from app.services.llm_service import OPENAIService

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Handle query requests"""
    try:
        # Instantiate the LLM service directly (no factory)
        llm_service = OPENAIService()
        
        # Use the service to process the query
        result = await llm_service.generate_response(request.query, request.id)
        

        # Return the processed result
        return QueryResponse(
            id=request.id,
            query=request.query,
            response=result
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors that might occur during processing
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}") 