from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship with ResumeDetails
    resumes = relationship("ResumeDetails", back_populates="user")

class ResumeDetails(Base):
    __tablename__ = "resume_details"

    resume_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    resume_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship with User
    user = relationship("User", back_populates="resumes")


class ResumeCritique(Base):
    __tablename__ = "resume_critiques"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resume_details.resume_id"), nullable=False)
    # Store the parsed critique structure
    review = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    resume = relationship("ResumeDetails")


class JobFitAnalysis(Base):
    __tablename__ = "jobfit_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resume_details.resume_id"), nullable=False)

    role = Column(String, nullable=True)
    location = Column(String, nullable=True)
    limit = Column(Integer, nullable=False, default=10)
    min_score = Column(Float, nullable=False, default=0.6)
    query_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    resume = relationship("ResumeDetails")
    jobs = relationship("JobFitAnalysisJob", back_populates="analysis", cascade="all, delete-orphan")


class JobFitAnalysisJob(Base):
    __tablename__ = "jobfit_analysis_jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("jobfit_analyses.id"), nullable=False)
    job_id = Column(String, nullable=False)
    similarity_score = Column(Float, nullable=False)
    job_metadata = Column(JSONB, nullable=True)

    analysis = relationship("JobFitAnalysis", back_populates="jobs")


class UserCurrentState(Base):
    __tablename__ = "user_current_state"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    current_resume_id = Column(Integer, ForeignKey("resume_details.resume_id"), nullable=True)
    current_resume_critique_id = Column(Integer, ForeignKey("resume_critiques.id"), nullable=True)
    current_jobfit_analysis_id = Column(Integer, ForeignKey("jobfit_analyses.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
