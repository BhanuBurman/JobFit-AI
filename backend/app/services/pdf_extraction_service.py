from typing import Any, Dict
from langchain_community.document_loaders import PyPDFLoader
from app.db.vector_store import build_chroma_from_text
from app.services.base_service import BaseService
from uuid import uuid4
from app.schemas.common import PDFExtractionResponse

class PDFExtractionService(BaseService):
    """Service to extract text from uploaded PDF files."""

    def __init__(self):
        super().__init__()

    async def process(self, file_path: str) -> Dict[str, Any]:
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        full_text = "\n".join([page.page_content for page in pages])
        # Disabling this resume vector embedding
        # collection_name = f"resumes_{uuid4().hex[:8]}"
        # vector_db = build_chroma_from_text(full_text, collection_name=collection_name)
        # print(vector_db)

        data = PDFExtractionResponse(
            collection_name="VECTOR DB DISABLED!",
            pages=len(pages),
            full_text=full_text,
        )

        return self.format_response(
            message="PDF processed successfully",
            data=data,
            success=True,
        )

    async def validate(self, file_path: str) -> bool:
        return bool(file_path and file_path.endswith(".pdf"))


