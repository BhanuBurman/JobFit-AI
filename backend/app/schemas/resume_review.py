from pydantic import BaseModel, Field
from typing import List

class ResumeReview(BaseModel):
    buzzwords: List[str] = Field(description="overused or cliché buzzwords in the resume")
    weak_sentences: List[str] = Field(description="vague, grammatically incorrect, or weak sentences")
    strong_points: List[str] = Field(description="the strongest elements of the resume")

    skills_score: int = Field(ge=0, le=10, description="Score relevance and strength of skills")
    experience_score: int = Field(ge=0, le=10, description="Score for relevance and impact of experience")
    clarity_score: int = Field(ge=0, le=10, description="Score for clarity and readability")
    ats_score: int = Field(ge=0, le=10, description="Score for ATS friendliness")

    missing_skills: List[str] = Field(description="missing but expected skills for the target role")
    irrelevant_content: List[str] = Field(description="Content that does not add value or is irrelevant")

    role_fit_analysis: str = Field(description="Analysis of alignment with a target role or job description")
    improvement_suggestions: List[str] = Field(description="Actionable recommendations to improve the resume")
    final_feedback: str = Field(description="Overall professional feedback and summary")


class ResumeReviewRequest(BaseModel):
    """Request payload for resume review"""
    resume_text: str = Field(..., description="Full resume text to analyze")
    k: int = Field(default=2, ge=1, le=10, description="Top-k documents for MMR retriever")
    lambda_mult: float = Field(default=0.5, ge=0.0, le=1.0, description="MMR diversity parameter")


class ResumeReviewResponse(BaseModel):
    """Structured response embedding the parsed review"""
    review: ResumeReview