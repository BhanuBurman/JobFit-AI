from typing import Any, Dict, List, Optional
import re
import os
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from app.services.base_service import BaseService
from app.schemas.search import SearchRequest, SearchResponse, JobMatch


class JobSearchService(BaseService):
    """Service for semantic job search using Chroma and local embeddings."""

    def __init__(self, collection_name: str = "job_postings_v2"):
        super().__init__()
        self.collection_name = collection_name

        base_root_dir = os.getenv("BASE_ROOT_DIR", ".")
        self.persist_directory = os.path.join(base_root_dir, "vector_db")

        # Must match the embedding model used for ingestion
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # Lazy init; created on first call
        self.vector_db: Optional[Chroma] = None

    def _get_vector_db(self) -> Chroma:
        if self.vector_db is None:
            self.vector_db = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory,
            )
        return self.vector_db

    async def process(self, request: SearchRequest) -> Dict[str, Any]:
        if not await self.validate(request):
            return self.format_response(
                message="Search query is required",
                data=None,
                success=False,
            )

        try:
            db = self._get_vector_db()

            results = db.similarity_search_with_score(
                query=request.query,
                k=request.limit or 10,
            )

            matches: List[JobMatch] = []
            min_score = request.min_score if request.min_score is not None else 0.7

            for doc, distance in results:
                # Chroma returns distance; normalize to similarity in [0,1]
                similarity = 1.0 - min(max(distance, 0.0), 2.0) / 2.0
                if similarity < min_score:
                    continue

                metadata = getattr(doc, "metadata", {}) or {}

                # Prefer canonical keys if present
                company_value = metadata.get("company") or metadata.get("company_name") or "Unknown Company"
                location_value = metadata.get("location", "Remote")

                # Build a readable salary range if possible
                min_salary = metadata.get("min_salary")
                max_salary = metadata.get("max_salary")
                currency = metadata.get("currency")
                pay_period = metadata.get("pay_period")  # e.g., YEARLY/MONTHLY/HOURLY

                salary_range_value: Optional[str] = None
                if isinstance(min_salary, (int, float)) and isinstance(max_salary, (int, float)) and currency:
                    period = f" {str(pay_period).lower()}" if isinstance(pay_period, str) else ""
                    # Format with thousand separators
                    salary_range_value = f"{currency} {int(min_salary):,} - {int(max_salary):,}{period}"

                skills_value = metadata.get("skills") or []
                if not skills_value:
                    skills_desc = metadata.get("skills_desc")
                    if isinstance(skills_desc, str):
                        # Split on commas, bullets, dashes, or newlines
                        parts = re.split(r"[,\n;•\-]+", skills_desc)
                        skills_value = [p.strip() for p in parts if p.strip()]
                if isinstance(skills_value, str):
                    skills_value = [skills_value]
                if not isinstance(skills_value, list):
                    skills_value = []

                matches.append(
                    JobMatch(
                        title=metadata.get("title", "Unknown Title"),
                        company=company_value,
                        location=location_value,
                        description=doc.page_content,
                        skills=skills_value,
                        salary_range=salary_range_value,
                        similarity_score=round(similarity, 3),
                        metadata=metadata,
                    )
                )

            response = SearchResponse(
                query=request.query,
                limit=request.limit or 10,
                total_matches=len(matches),
                matches=matches,
            )

            return self.format_response(
                message="Job search completed successfully",
                data=response.model_dump(),
                success=True,
            )

        except Exception as e:
            return self.format_response(
                message=f"Error during job search: {str(e)}",
                data=None,
                success=False,
            )

    async def validate(self, request: SearchRequest) -> bool:
        return bool(request and isinstance(request.query, str) and request.query.strip())

    async def search_from_resume(
        self,
        resume_text: str,
        resume_analysis: Optional[Dict[str, Any]] = None,
        limit: int = 10,
        min_score: float = 0.6,
    ) -> Dict[str, Any]:
        """Search jobs using resume text and optional analysis-derived terms."""
        terms: List[str] = []

        if resume_analysis:
            # Attempt to enrich from analysis fields if present
            strong_points = resume_analysis.get("strong_points") or []
            if isinstance(strong_points, list):
                terms.extend(strong_points)

            role_fit = resume_analysis.get("role_fit_analysis")
            if isinstance(role_fit, str):
                terms.append(role_fit)

            missing_skills = resume_analysis.get("missing_skills") or []
            if isinstance(missing_skills, list):
                terms.extend(missing_skills)

        if not terms:
            # Fallback to resume snippet
            terms = [resume_text[:1000]]

        query = " ".join([t for t in terms if isinstance(t, str) and t.strip()][:5])

        req = SearchRequest(query=query or resume_text[:500], limit=limit, min_score=min_score)
        return await self.process(req)

    async def get_job_detail(self, job_id: str | int) -> Dict[str, Any]:
        """Fetch full job details by job_id by aggregating all chunks for that job."""
        try:
            db = self._get_vector_db()
            # Use internal collection to filter by metadata
            where_value: Any
            try:
                where_value = int(job_id)
            except Exception:
                where_value = job_id

            results = db._collection.get(where={"job_id": where_value})
            documents: List[str] = results.get("documents") or []
            metadatas: List[Dict[str, Any]] = results.get("metadatas") or []

            if not documents:
                return self.format_response(
                    message="Job not found",
                    data=None,
                    success=False,
                )

            full_description = "\n\n".join(documents)
            md = metadatas[0] if metadatas else {}

            company_value = md.get("company") or md.get("company_name") or "Unknown Company"
            location_value = md.get("location", "Remote")

            min_salary = md.get("min_salary")
            max_salary = md.get("max_salary")
            currency = md.get("currency")
            pay_period = md.get("pay_period")
            salary_range_value = None
            if isinstance(min_salary, (int, float)) and isinstance(max_salary, (int, float)) and currency:
                period = f" {str(pay_period).lower()}" if isinstance(pay_period, str) else ""
                salary_range_value = f"{currency} {int(min_salary):,} - {int(max_salary):,}{period}"

            skills_value = md.get("skills") or []
            if not skills_value:
                skills_desc = md.get("skills_desc")
                if isinstance(skills_desc, str):
                    parts = re.split(r"[,\n;•\-]+", skills_desc)
                    skills_value = [p.strip() for p in parts if p.strip()]
            if isinstance(skills_value, str):
                skills_value = [skills_value]
            if not isinstance(skills_value, list):
                skills_value = []

            data = {
                "job_id": str(md.get("job_id") or job_id),
                "title": md.get("title", "Unknown Title"),
                "company": company_value,
                "location": location_value,
                "full_description": full_description,
                "skills": skills_value,
                "salary_range": salary_range_value,
                "metadata": md,
            }

            return self.format_response(
                message="Job detail fetched",
                data=data,
                success=True,
            )
        except Exception as e:
            return self.format_response(
                message=f"Error fetching job detail: {str(e)}",
                data=None,
                success=False,
            )


