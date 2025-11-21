from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class LearningModule(BaseModel):
    """Individual learning module schema"""
    title: str = Field(description="Module title")
    duration: str = Field(description="Estimated duration (e.g., '2 weeks')")
    outcome: str = Field(description="Expected learning outcome")
    assessment: str = Field(description="How to assess proficiency")
    resources: Optional[List[Dict[str, str]]] = Field(default=None, description="Optional resources with title and url")


class PriorityAnalysis(BaseModel):
    """Analysis of skill priorities"""
    critical: List[str] = Field(description="Critical skills required for the job")
    supporting: List[str] = Field(description="Supporting skills that add value")
    deferred: List[str] = Field(description="Skills not essential for this role")
    rationale: str = Field(description="Explanation of prioritization logic")


class ScoreImprovements(BaseModel):
    """Expected score improvements"""
    skills_target: int = Field(description="Target skills score (0-10)")
    experience_target: int = Field(description="Target experience score (0-10)")
    clarity_target: int = Field(description="Target clarity score (0-10)")


class LearningPlanResponse(BaseModel):
    """Complete learning plan response"""
    basic_plan: List[LearningModule] = Field(description="Essential modules for job readiness")
    advanced_plan: List[LearningModule] = Field(description="Advanced modules for deeper expertise")
    priority_analysis: PriorityAnalysis
    score_improvements: ScoreImprovements
    estimated_duration: str = Field(description="Total estimated duration")
    generated_at: datetime = Field(default_factory=datetime.now)
    job_selected: Dict[str, Any] = Field(description="Selected job details")
    resume_analysis_used: Dict[str, Any] = Field(description="Resume analysis data used")


class LearningPlanRequest(BaseModel):
    """Request to generate learning plan"""
    resume_id: int = Field(description="Resume ID to use")
    timeline_months: int = Field(default=3, description="Available time in months")
    experience_level: str = Field(default="intermediate", description="Current experience level")
    job_analysis_id: Optional[int] = Field(default=None, description="Specific job analysis to use, or None for latest")
    rag_enabled: bool = Field(default=False, description="Whether to attach resources via RAG")


class LearningPlanGenerateResponse(BaseModel):
    """Response for async learning plan generation"""
    plan_id: str = Field(description="Unique plan identifier")
    status: str = Field(description="Generation status")
    estimated_completion: datetime = Field(description="When plan will be ready")
