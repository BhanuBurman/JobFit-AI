from fastapi import APIRouter, HTTPException
from app.schemas.resume_review import ResumeReviewRequest, ResumeReviewResponse, ResumeReview
from app.services.resume_review_service import ResumeReviewService


router = APIRouter()


@router.post("/resume/review", response_model=ResumeReviewResponse)
async def review_resume(request: ResumeReviewRequest):
    try:
        service = ResumeReviewService()
        result = await service.process(request)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Invalid input"))

        review_data = result["data"]["review"]
        return ResumeReviewResponse(review=ResumeReview(**review_data))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reviewing resume: {str(e)}")


