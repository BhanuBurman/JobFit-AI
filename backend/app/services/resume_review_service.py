from typing import Any, Dict
from langchain_core.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from app.schemas.resume_review import (
    ResumeReview,
    ResumeReviewRequest,
)
from app.services.base_service import BaseService
from app.external import llm


class ResumeReviewService(BaseService):
    """Service to analyze a resume and return structured feedback."""

    def __init__(self):
        super().__init__()
        self.parser = PydanticOutputParser(pydantic_object=ResumeReview)
        self.prompt = ChatPromptTemplate.from_template(
            """
You are an expert resume reviewer. Analyze the following resume and return structured feedback.
Extract ALL technical skills, programming languages, frameworks, tools, technologies, and soft skills mentioned in the resume.

Resume:
{resume_text}

{format_instructions}
            """
        )

    async def process(self, request: ResumeReviewRequest) -> Dict[str, Any]:
        if not await self.validate(request):
            return self.format_response(
                message="Resume text is required",
                data=None,
                success=False,
            )
        
        chain = self.prompt | llm | self.parser

        result: ResumeReview = chain.invoke(
            {
                "resume_text": request.resume_text,
                "format_instructions": self.parser.get_format_instructions(),
            }
        )

        return self.format_response(
            message="Resume reviewed successfully",
            data={"review": result.model_dump()},
            success=True,
        )

    async def validate(self, request: ResumeReviewRequest) -> bool:
        return bool(request and isinstance(request.resume_text, str) and request.resume_text.strip())


