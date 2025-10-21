from fastapi import APIRouter, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from app.schemas.search import SearchResponse, SearchRequest, ResumeSearchRequest, JobDetailResponse, JobFitSavedResponse
from app.services.job_search_service import JobSearchService
from app.core.database import get_db
from app.services.auth_service import get_current_user
from app.schemas.user import User as UserSchema
from app.db.models import JobFitAnalysis, JobFitAnalysisJob
from app.db.models import ResumeDetails

router = APIRouter()
service = JobSearchService()


@router.post("/search", response_model=SearchResponse)
async def search_jobs(request: SearchRequest):
    """Semantic search for jobs using a free-text query."""
    result = await service.process(request)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Search failed"))
    return SearchResponse(**result["data"])  # type: ignore[arg-type]


@router.post("/search/resume", response_model=SearchResponse)
async def search_jobs_from_resume(
    request: ResumeSearchRequest,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user),
):
    """Semantic search for jobs using resume text and optional analysis. Persist analysis if resume_id provided."""
    result = await service.search_from_resume(
        resume_text=request.resume_text,
        resume_analysis=request.resume_analysis,
        limit=request.limit or 10,
        min_score=request.min_score or 0.6,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Search failed"))

    data = result["data"]

    # Persist only if resume_id is provided
    if request.resume_id is not None:
        analysis = JobFitAnalysis(
            user_id=current_user.id,
            resume_id=request.resume_id,
            role=request.role,
            location=request.location,
            limit=request.limit or 10,
            min_score=request.min_score or 0.6,
            query_text=request.resume_text[:1000],
        )
        db.add(analysis)
        db.flush()

        matches = data.get("matches") or []
        rows = []
        for m in matches:
            md = (m.get("metadata") or {})
            job_id = str(md.get("job_id") or m.get("title"))
            rows.append(JobFitAnalysisJob(
                analysis_id=analysis.id,
                job_id=job_id,
                similarity_score=float(m.get("similarity_score") or 0.0),
                job_metadata=md,
            ))
        if rows:
            db.add_all(rows)
        db.commit()

    return SearchResponse(**data)  # type: ignore[arg-type]


def _to_search_response(analysis: JobFitAnalysis, jobs: list[JobFitAnalysisJob]) -> SearchResponse:
    matches = []
    for j in jobs:
        md = (j.job_metadata or {})
        matches.append({
            "title": str(md.get("title") or md.get("job_title") or ""),
            "company": str(md.get("company") or md.get("company_name") or ""),
            "location": str(md.get("location") or ""),
            "description": str(md.get("description") or ""),
            "skills": list(md.get("skills") or []),
            "salary_range": None,
            "similarity_score": float(j.similarity_score),
            "metadata": dict(md),
        })
    return SearchResponse(
        query=analysis.query_text or "",
        limit=analysis.limit,
        total_matches=len(matches),
        matches=matches,
    )


@router.get("/jobfit/analysis/latest", response_model=JobFitSavedResponse)
async def get_latest_jobfit_analysis(
    resume_id: int,
    role: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user),
):
    q = db.query(JobFitAnalysis).filter(
        JobFitAnalysis.user_id == current_user.id,
        JobFitAnalysis.resume_id == resume_id,
    )
    if role is not None:
        q = q.filter(JobFitAnalysis.role == role)
    if location is not None:
        q = q.filter(JobFitAnalysis.location == location)

    analysis = q.order_by(JobFitAnalysis.created_at.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")

    jobs = db.query(JobFitAnalysisJob).filter(JobFitAnalysisJob.analysis_id == analysis.id).all()
    return JobFitSavedResponse(analysis_id=analysis.id, result=_to_search_response(analysis, jobs))


@router.put("/jobfit/analysis/{analysis_id}/refresh", response_model=JobFitSavedResponse)
async def refresh_jobfit_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_user),
):
    analysis = db.query(JobFitAnalysis).filter(
        JobFitAnalysis.id == analysis_id,
        JobFitAnalysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    resume = db.query(ResumeDetails).filter(
        ResumeDetails.resume_id == analysis.resume_id,
        ResumeDetails.user_id == current_user.id,
    ).first()
    if not resume or not resume.resume_text:
        raise HTTPException(status_code=404, detail="Resume not found or empty")

    result = await service.search_from_resume(
        resume_text=resume.resume_text,
        resume_analysis=None,
        limit=analysis.limit,
        min_score=analysis.min_score,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Search failed"))

    data = result["data"]
    new_matches = data.get("matches") or []

    old_jobs = db.query(JobFitAnalysisJob).filter(JobFitAnalysisJob.analysis_id == analysis.id).all()
    old_ids = {str((j.job_metadata or {}).get("job_id") or j.job_id) for j in old_jobs}
    new_ids = {str((m.get("metadata") or {}).get("job_id") or m.get("title")) for m in new_matches}

    if new_ids != old_ids:
        for j in old_jobs:
            db.delete(j)
        db.flush()
        rows = []
        for m in new_matches:
            md = (m.get("metadata") or {})
            job_id = str(md.get("job_id") or m.get("title"))
            rows.append(JobFitAnalysisJob(
                analysis_id=analysis.id,
                job_id=job_id,
                similarity_score=float(m.get("similarity_score") or 0.0),
                job_metadata=md,
            ))
        if rows:
            db.add_all(rows)
        db.commit()

    current_jobs = db.query(JobFitAnalysisJob).filter(JobFitAnalysisJob.analysis_id == analysis.id).all()
    return JobFitSavedResponse(analysis_id=analysis.id, result=_to_search_response(analysis, current_jobs))


@router.get("/search/job/{job_id}", response_model=JobDetailResponse)
async def get_job_detail(job_id: str):
    result = await service.get_job_detail(job_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Not found"))
    return JobDetailResponse(**result["data"])  # type: ignore[arg-type]