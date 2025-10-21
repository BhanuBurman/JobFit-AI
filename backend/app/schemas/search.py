from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class JobMatch(BaseModel):
    title: str
    company: str
    location: str
    description: str
    skills: List[str]
    salary_range: Optional[str] = None
    similarity_score: float
    metadata: Dict[str, Any] = {}


class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10
    min_score: Optional[float] = 0.7


class SearchResponse(BaseModel):
    query: str
    limit: int
    total_matches: int
    matches: List[JobMatch]


class ResumeSearchRequest(BaseModel):
    resume_text: str
    resume_id: Optional[int] = None
    role: Optional[str] = None
    location: Optional[str] = None
    resume_analysis: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 10
    min_score: Optional[float] = 0.6


class JobDetailResponse(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    full_description: str
    skills: List[str] = []
    salary_range: Optional[str] = None
    metadata: Dict[str, Any] = {}


class JobFitSavedResponse(BaseModel):
    analysis_id: int
    result: SearchResponse