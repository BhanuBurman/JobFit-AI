from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.db.models import ResumeDetails, User as UserModel
from app.schemas.resume import ResumeDetails as ResumeSchema, ResumeDetailsCreate, ResumeDetailsUpdate
from app.schemas.user import User as UserSchema
from app.services.auth_service import get_current_user

router = APIRouter()

@router.post("/resumes", response_model=ResumeSchema)
async def create_resume(
    file_name: str = Form(...),
    resume_text: str = Form(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new resume for the current user"""
    db_resume = ResumeDetails(
        user_id=current_user.id,
        file_name=file_name,
        resume_text=resume_text
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return ResumeSchema.from_orm(db_resume)

@router.get("/resumes/{resume_id}", response_model=ResumeSchema)
async def get_resume(
    resume_id: int,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume by ID"""
    db_resume = db.query(ResumeDetails).filter(
        ResumeDetails.resume_id == resume_id,
        ResumeDetails.user_id == current_user.id
    ).first()

    if db_resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeSchema.from_orm(db_resume)

@router.get("/resumes", response_model=List[ResumeSchema])
async def get_user_resumes(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for the current user"""
    resumes = db.query(ResumeDetails).filter(
        ResumeDetails.user_id == current_user.id
    ).all()
    return [ResumeSchema.from_orm(resume) for resume in resumes]

@router.put("/resumes/{resume_id}", response_model=ResumeSchema)
async def update_resume(
    resume_id: int,
    file_name: str = Form(...),
    resume_text: str = Form(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a resume"""
    db_resume = db.query(ResumeDetails).filter(
        ResumeDetails.resume_id == resume_id,
        ResumeDetails.user_id == current_user.id
    ).first()

    if db_resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    db_resume.file_name = file_name
    db_resume.resume_text = resume_text

    db.commit()
    db.refresh(db_resume)
    return ResumeSchema.from_orm(db_resume)

@router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: int,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    db_resume = db.query(ResumeDetails).filter(
        ResumeDetails.resume_id == resume_id,
        ResumeDetails.user_id == current_user.id
    ).first()

    if db_resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    db.delete(db_resume)
    db.commit()
    return {"message": "Resume deleted successfully"}
