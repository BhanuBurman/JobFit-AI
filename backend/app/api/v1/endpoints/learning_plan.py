from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import User as UserSchema
from app.services.auth_service import get_current_user
from app.services.learning_plan_service import LearningPlanService
from app.schemas.learning_plan import LearningPlanRequest, LearningPlanResponse
from app.db.models import ResumeDetails

router = APIRouter()
service = LearningPlanService()

@router.post("/learning-plan/generate", response_model=LearningPlanResponse)
async def generate_learning_plan(
    request: LearningPlanRequest,
    background_tasks: BackgroundTasks,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized learning plan for job readiness"""

    try:
        # Validate that resume belongs to user
        resume = db.query(ResumeDetails).filter(
            ResumeDetails.resume_id == request.resume_id,
            ResumeDetails.user_id == current_user.id
        ).first()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # For now, generate synchronously (can be made async later)
        result = await service.generate_plan(
            db=db,
            resume_id=request.resume_id,
            timeline_months=request.timeline_months,
            experience_level=request.experience_level,
            job_analysis_id=request.job_analysis_id,
            rag_enabled=request.rag_enabled
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to generate plan"))

        # Return the complete learning plan directly
        return result["data"]  # This is already a LearningPlanResponse object

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
