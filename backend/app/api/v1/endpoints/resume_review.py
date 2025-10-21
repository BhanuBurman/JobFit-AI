from fastapi import APIRouter, HTTPException, Form, Depends
from sqlalchemy.orm import Session
from app.schemas.resume_review import ResumeReviewRequest, ResumeReviewResponse, ResumeReview
from app.services.resume_review_service import ResumeReviewService
from app.core.database import get_db
from app.db.models import ResumeDetails, ResumeCritique
from app.services.auth_service import get_current_user
from app.schemas.user import User as UserSchema


router = APIRouter()


@router.post("/resume/review", response_model=ResumeReviewResponse)
async def review_resume(
    resume_id: int = Form(...),
    resume_text: str = Form(...),
    k: int = Form(2),
    lambda_mult: float = Form(0.5),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user),
):
    try:
        # Verify resume belongs to current user
        db_resume = db.query(ResumeDetails).filter(
            ResumeDetails.resume_id == resume_id,
            ResumeDetails.user_id == current_user.id
        ).first()
        if not db_resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Process supplied text (frontend must send same text tied to resume_id)
        request = ResumeReviewRequest(resume_text=resume_text, k=k, lambda_mult=lambda_mult)
        service = ResumeReviewService()
        result = await service.process(request)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Resume review failed"))

        review_data = result["data"]["review"]

        # Persist result
        critique = ResumeCritique(
            user_id=current_user.id,
            resume_id=resume_id,
            review=review_data
        )
        db.add(critique)
        db.commit()

        return ResumeReviewResponse(review=ResumeReview(**review_data))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reviewing resume: {str(e)}")

@router.get("/resume/{resume_id}/review", response_model=ResumeReviewResponse)
async def get_latest_resume_review(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user),
):
    critique = (
        db.query(ResumeCritique)
        .filter(
            ResumeCritique.resume_id == resume_id,
            ResumeCritique.user_id == current_user.id,
        )
        .order_by(ResumeCritique.created_at.desc())
        .first()
    )
    if not critique:
        raise HTTPException(status_code=404, detail="No critique found for this resume")

    # critique.review is already structured JSON matching ResumeReview
    return ResumeReviewResponse(review=ResumeReview(**critique.review))


# Note: merged behavior into single endpoint above

