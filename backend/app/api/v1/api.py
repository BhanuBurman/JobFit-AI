from fastapi import APIRouter
from .endpoints import health, query, users, search, resume_review, upload, text_extractor, resume

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(query.router, tags=["query"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(search.router, tags=["search"])
api_router.include_router(resume_review.router, tags=["resume"])
api_router.include_router(upload.router, tags=["upload"])
api_router.include_router(text_extractor.router, tags=["extraction"])
api_router.include_router(resume.router, tags=["resume-management"])