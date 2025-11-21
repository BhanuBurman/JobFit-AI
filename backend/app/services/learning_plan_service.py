from typing import Dict, List, Any, Optional, TypedDict
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END

from app.db.models import ResumeCritique, JobFitAnalysis, JobFitAnalysisJob, ResumeDetails
from app.external.llm_clients.openai_client import llm
from app.services.job_search_service import JobSearchService
from app.schemas.learning_plan import LearningPlanResponse, LearningModule, PriorityAnalysis, ScoreImprovements


class PlanState(TypedDict, total=False):
    """State for learning plan generation pipeline"""
    # Input data
    resume_id: int
    job_analysis_id: Optional[int]
    timeline_months: int
    experience_level: str
    rag_enabled: bool

    # Retrieved data
    resume_critique: Dict[str, Any]
    job_matches: List[Dict[str, Any]]
    selected_job: Dict[str, Any]

    # Processing state
    extracted_skills: List[str]
    present_skills: List[str]
    gaps: List[str]
    priorities: Dict[str, List[str]]

    # Output state
    basic_plan: List[Dict[str, Any]]
    advanced_plan: List[Dict[str, Any]]
    priority_analysis: Dict[str, Any]
    score_improvements: Dict[str, int]
    estimated_duration: str

    # Control
    plan_id: str
    error: Optional[str]
    logs: List[str]


class LearningPlanService:
    """Service for generating job-targeted learning plans using LangGraph orchestration"""

    def __init__(self):
        self.job_search_service = JobSearchService()

    async def generate_plan(
        self,
        db: Session,
        resume_id: int,
        timeline_months: int = 3,
        experience_level: str = "intermediate",
        job_analysis_id: Optional[int] = None,
        rag_enabled: bool = False
    ) -> Dict[str, Any]:
        """Generate learning plan using LLM-powered orchestration"""

        # Generate unique plan ID
        plan_id = str(uuid.uuid4())

        # Initialize state
        initial_state: PlanState = {
            "resume_id": resume_id,
            "job_analysis_id": job_analysis_id,
            "timeline_months": timeline_months,
            "experience_level": experience_level,
            "rag_enabled": rag_enabled,
            "plan_id": plan_id,
            "logs": [f"Starting learning plan generation for resume {resume_id}"]
        }

        try:
            # Execute the orchestrated pipeline
            final_state = await self._run_pipeline(db, initial_state)

            if final_state.get("error"):
                return {
                    "success": False,
                    "message": final_state["error"],
                    "plan_id": plan_id
                }

            # Convert to response format
            response = self._build_response(final_state)

            return {
                "success": True,
                "message": "Learning plan generated successfully",
                "data": response.model_dump(),
                "plan_id": plan_id
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to generate learning plan: {str(e)}",
                "plan_id": plan_id
            }

    async def _run_pipeline(self, db: Session, state: PlanState) -> PlanState:
        """Run the complete orchestrated pipeline"""

        # 1. Load resume critique data
        state = await self._load_resume_data(db, state)
        if state.get("error"):
            return state

        # 2. Load and select best job
        state = await self._load_job_data(db, state)
        if state.get("error"):
            return state

        # 3. Extract skills from job description using LLM
        state = await self._extract_job_skills_llm(state)
        if state.get("error"):
            return state

        # 4. Ground resume capabilities (deterministic)
        state = self._ground_resume_capabilities(state)

        # 5. Compute gaps and priorities (deterministic)
        state = self._compute_gaps_and_priorities(state)

        # 6. Synthesize learning modules (LLM-powered)
        state = await self._synthesize_modules(state)
        if state.get("error"):
            return state

        # 7. Attach resources if RAG enabled
        if state.get("rag_enabled"):
            state = await self._attach_resources(state)

        # 8. Package final response
        state = self._package_response(state)

        return state

    async def _load_resume_data(self, db: Session, state: PlanState) -> PlanState:
        """Load resume critique data from database"""
        logs = state.get("logs", [])

        try:
            # Get resume critique
            critique = db.query(ResumeCritique).filter(
                ResumeCritique.resume_id == state["resume_id"]
            ).order_by(ResumeCritique.created_at.desc()).first()

            if not critique:
                return {**state, "error": "No resume critique found", "logs": logs + ["No resume critique found"]}

            state["resume_critique"] = critique.review
            logs.append("Loaded resume critique data")

        except Exception as e:
            return {**state, "error": f"Failed to load resume data: {str(e)}", "logs": logs + [f"Resume data load error: {str(e)}"]}

        return {**state, "logs": logs}

    async def _load_job_data(self, db: Session, state: PlanState) -> PlanState:
        """Load job analysis data and select best job"""
        logs = state.get("logs", [])

        try:
            analysis_id = state.get("job_analysis_id")

            if analysis_id:
                # Use specific analysis
                analysis = db.query(JobFitAnalysis).filter(
                    JobFitAnalysis.id == analysis_id
                ).first()
            else:
                # Use latest analysis for this resume
                analysis = db.query(JobFitAnalysis).filter(
                    JobFitAnalysis.resume_id == state["resume_id"]
                ).order_by(JobFitAnalysis.created_at.desc()).first()

            if not analysis:
                return {**state, "error": "No job analysis found", "logs": logs + ["No job analysis found"]}

            # Get job matches
            job_matches = db.query(JobFitAnalysisJob).filter(
                JobFitAnalysisJob.analysis_id == analysis.id
            ).order_by(JobFitAnalysisJob.similarity_score.desc()).all()

            if not job_matches:
                return {**state, "error": "No job matches found", "logs": logs + ["No job matches found"]}

            # Select best job (highest similarity score)
            best_job_db = job_matches[0]
            state["job_matches"] = [self._convert_job_match(j) for j in job_matches]

            # Get full job details
            job_detail_result = await self.job_search_service.get_job_detail(best_job_db.job_id)
            if not job_detail_result.get("success"):
                return {**state, "error": "Failed to get job details", "logs": logs + ["Failed to get job details"]}

            selected_job = job_detail_result["data"]
            selected_job["similarity_score"] = best_job_db.similarity_score
            state["selected_job"] = selected_job

            logs.append(f"Selected best job: {selected_job.get('title')} at {selected_job.get('company')}")

        except Exception as e:
            return {**state, "error": f"Failed to load job data: {str(e)}", "logs": logs + [f"Job data load error: {str(e)}"]}

        return {**state, "logs": logs}

    def _convert_job_match(self, job_db: JobFitAnalysisJob) -> Dict[str, Any]:
        """Convert database job match to dict"""
        metadata = job_db.job_metadata or {}
        return {
            "job_id": job_db.job_id,
            "title": metadata.get("title", ""),
            "company": metadata.get("company", ""),
            "similarity_score": job_db.similarity_score,
            "metadata": metadata
        }

    async def _extract_job_skills_llm(self, state: PlanState) -> PlanState:
        """Extract skills from job description using LLM only"""
        logs = state.get("logs", [])

        try:
            job = state["selected_job"]
            job_description = job.get("full_description", "")

            # LLM-powered skill extraction
            prompt = PromptTemplate.from_template("""
            Extract technical and professional skills required for this job. Be comprehensive and specific.

            Job Description: {job_description}

            Return only JSON with a "skills" array containing specific technologies, frameworks, tools, and skills.
            Include both technical and soft skills. Focus on requirements explicitly mentioned or strongly implied.
            Be precise - don't add generic skills unless clearly required.

            Examples of what to extract:
            - Programming languages (Python, JavaScript, TypeScript)
            - Frameworks (React, Next.js, NestJS, Django)
            - Tools (Docker, Kubernetes, Git, AWS)
            - Methodologies (Agile, TDD, CI/CD)
            - Soft skills (Communication, Leadership, Problem-solving)

            Response format: {{"skills": ["skill1", "skill2", "skill3", ...]}}
            """)

            chain = prompt | llm | JsonOutputParser()
            result = await chain.ainvoke({"job_description": job_description})

            extracted_skills = result.get("skills", [])

            # Validate extraction
            if not extracted_skills or len(extracted_skills) < 3:
                return {**state, "error": "Insufficient skills extracted from job description", "logs": logs + ["LLM skill extraction failed - too few skills"]}

            state["extracted_skills"] = extracted_skills
            logs.append(f"LLM extracted {len(extracted_skills)} skills: {', '.join(extracted_skills[:5])}...")

        except Exception as e:
            return {**state, "error": f"Failed to extract skills from job description: {str(e)}", "logs": logs + [f"LLM skill extraction error: {str(e)}"]}

        return {**state, "logs": logs}

    def _ground_resume_capabilities(self, state: PlanState) -> PlanState:
        """Ground resume capabilities from critique data"""
        logs = state.get("logs", [])

        review = state["resume_critique"]

        # Present skills from strong_points and skills fields
        present_skills = review.get("strong_points", [])
        if review.get("skills"):
            present_skills.extend(review["skills"])

        # Remove duplicates and normalize
        present_skills = list(set(present_skills))

        # Add inferred skills based on role_fit_analysis
        role_fit = review.get("role_fit_analysis", "").lower()
        if "frontend" in role_fit or "react" in role_fit:
            present_skills.extend(["JavaScript", "HTML", "CSS"])
        if "backend" in role_fit or "node" in role_fit or "api" in role_fit:
            present_skills.extend(["JavaScript", "APIs"])

        present_skills = list(set(present_skills))  # Remove duplicates again

        state["present_skills"] = present_skills
        logs.append(f"Grounded {len(present_skills)} present skills from resume")

        return {**state, "logs": logs}

    def _compute_gaps_and_priorities(self, state: PlanState) -> PlanState:
        """Compute skill gaps and prioritize based on job requirements"""
        logs = state.get("logs", [])

        required = set(state["extracted_skills"])
        present = set(state["present_skills"])

        gaps = list(required - present)

        # Prioritization logic
        review = state["resume_critique"]
        timeline_months = state["timeline_months"]

        # Critical: skills explicitly mentioned and missing
        critical = gaps.copy()

        # Add supporting skills based on job type
        jd_text = state["selected_job"].get("full_description", "").lower()
        if "full" in jd_text and "stack" in jd_text:
            supporting_skills = ["Testing", "CI/CD", "System Design"]
            supporting = [s for s in supporting_skills if s in required and s not in present]
        else:
            supporting = []

        # Deferred: skills from resume missing list that aren't in job requirements
        resume_missing = set(review.get("missing_skills", []))
        deferred = list(resume_missing - required)

        priorities = {
            "critical": critical,
            "supporting": supporting,
            "deferred": deferred
        }

        state["gaps"] = gaps
        state["priorities"] = priorities

        logs.append(f"Computed {len(gaps)} skill gaps, prioritized into {len(critical)} critical, {len(supporting)} supporting, {len(deferred)} deferred")

        return {**state, "logs": logs}

    async def _synthesize_modules(self, state: PlanState) -> PlanState:
        """Synthesize learning modules using LLM"""
        logs = state.get("logs", [])

        try:
            priorities = state["priorities"]
            timeline_months = state["timeline_months"]
            experience_level = state["experience_level"]

            # Prepare prompt for basic plan
            basic_prompt = PromptTemplate.from_template("""
            Create a focused learning plan for job readiness. Generate 4-6 concise modules.

            Job Requirements: {critical_skills}
            Timeline: {timeline_months} months
            Experience Level: {experience_level}

            Return JSON with "modules" array. Each module must have:
            - title: descriptive title
            - duration: time estimate (e.g., "2 weeks")
            - outcome: specific learning outcome
            - assessment: how to verify proficiency

            Focus on practical, job-ready skills. Keep modules actionable and time-bounded.

            Response format: {{"modules": [{{"title": "...", "duration": "...", "outcome": "...", "assessment": "..."}}]}}
            """)

            # Generate basic plan
            basic_chain = basic_prompt | llm | JsonOutputParser()
            basic_result = await basic_chain.ainvoke({
                "critical_skills": ", ".join(priorities["critical"]),
                "timeline_months": timeline_months,
                "experience_level": experience_level
            })

            basic_modules = basic_result.get("modules", [])

            # Generate advanced plan (stretch goals)
            advanced_prompt = PromptTemplate.from_template("""
            Create advanced learning modules for deeper expertise. Generate 2-4 modules.

            Job Requirements: {critical_skills}
            Supporting Skills: {supporting_skills}
            Timeline: {timeline_months} months
            Experience Level: {experience_level}

            Return JSON with "modules" array. Each module should build on basic skills and provide competitive advantage.

            Response format: {{"modules": [{{"title": "...", "duration": "...", "outcome": "...", "assessment": "..."}}]}}
            """)

            advanced_chain = advanced_prompt | llm | JsonOutputParser()
            advanced_result = await advanced_chain.ainvoke({
                "critical_skills": ", ".join(priorities["critical"]),
                "supporting_skills": ", ".join(priorities["supporting"]),
                "timeline_months": timeline_months,
                "experience_level": experience_level
            })

            advanced_modules = advanced_result.get("modules", [])

            state["basic_plan"] = basic_modules
            state["advanced_plan"] = advanced_modules

            logs.append(f"Synthesized {len(basic_modules)} basic and {len(advanced_modules)} advanced modules")

        except Exception as e:
            return {**state, "error": f"Failed to synthesize modules: {str(e)}", "logs": logs + [f"Module synthesis error: {str(e)}"]}

        return {**state, "logs": logs}

    async def _attach_resources(self, state: PlanState) -> PlanState:
        """Attach resources using RAG (simplified)"""
        # For now, just add some curated resources
        # In production, this would use vector search

        curated_resources = {
            "React": [{"title": "React Official Docs", "url": "https://react.dev"}],
            "Next.js": [{"title": "Next.js Docs", "url": "https://nextjs.org/docs"}],
            "TypeScript": [{"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs"}],
            "Node.js": [{"title": "Node.js Docs", "url": "https://nodejs.org/en/docs"}],
            "Docker": [{"title": "Docker Docs", "url": "https://docs.docker.com"}],
        }

        # Attach resources to basic plan modules
        for module in state.get("basic_plan", []):
            module_title = module.get("title", "")
            for skill, resources in curated_resources.items():
                if skill in module_title:
                    module["resources"] = resources
                    break

        return state

    def _package_response(self, state: PlanState) -> PlanState:
        """Package final response with estimates and analysis"""
        logs = state.get("logs", [])

        # Calculate score improvements
        review = state["resume_critique"]
        current_skills = review.get("skills_score", 5)
        current_experience = review.get("experience_score", 5)
        current_clarity = review.get("clarity_score", 5)

        # Estimate improvements based on plan
        score_improvements = {
            "skills_target": min(10, current_skills + 2),
            "experience_target": min(10, current_experience + 1),
            "clarity_target": min(10, current_clarity + 1)
        }

        # Estimate total duration
        timeline_months = state["timeline_months"]
        estimated_duration = f"~{timeline_months} months"

        # Build priority analysis
        priorities = state["priorities"]
        priority_analysis = {
            "critical": priorities["critical"],
            "supporting": priorities["supporting"],
            "deferred": priorities["deferred"],
            "rationale": f"Prioritized based on job requirements from {state['selected_job'].get('title')} at {state['selected_job'].get('company')}"
        }

        state["score_improvements"] = score_improvements
        state["estimated_duration"] = estimated_duration
        state["priority_analysis"] = priority_analysis

        logs.append("Packaged final learning plan response")

        return {**state, "logs": logs}

    def _build_response(self, state: PlanState) -> LearningPlanResponse:
        """Build the final response object"""

        # Convert modules to proper schema
        basic_plan = [LearningModule(**module) for module in state.get("basic_plan", [])]
        advanced_plan = [LearningModule(**module) for module in state.get("advanced_plan", [])]

        return LearningPlanResponse(
            basic_plan=basic_plan,
            advanced_plan=advanced_plan,
            priority_analysis=PriorityAnalysis(**state["priority_analysis"]),
            score_improvements=ScoreImprovements(**state["score_improvements"]),
            estimated_duration=state["estimated_duration"],
            job_selected=state["selected_job"],
            resume_analysis_used=state["resume_critique"]
        )
