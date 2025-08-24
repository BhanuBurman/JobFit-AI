from typing import Any, Dict
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from app.db.vector_store import build_chroma_from_text
from app.services.base_service import BaseService
from app.constents.file_uploads_constents import UPLOAD_BASE_DIR
import os
from uuid import uuid4

class PDFExtractionService(BaseService):
    """Service to extract text from uploaded PDF files."""

    def __init__(self):
        super().__init__()

    async def process(self, file: UploadFile) -> Dict[str, Any]:
        if not await self.validate(file):
            return self.format_response(
                message="Invalid file. Please upload a PDF.",
                data=None,
                success=False,
            )

        # Save to a path for PyPDFLoader
        contents = await file.read()
        upload_path = f"{UPLOAD_BASE_DIR}/{file.filename}"
        os.makedirs(UPLOAD_BASE_DIR, exist_ok=True)
        with open(upload_path, "wb") as f:
            f.write(contents)

        loader = PyPDFLoader(upload_path)
        pages = loader.load()
        full_text = "\n".join([page.page_content for page in pages])
        collection_name = f"resumes_{uuid4().hex[:8]}"
        vector_db = build_chroma_from_text(full_text, collection_name=collection_name)
        print(vector_db)
        return self.format_response(
            message="PDF processed successfully",
            data={
                "filename": file.filename,
                "collection_name": collection_name,
                "pages": len(pages),
                "full_text": full_text,
            },
            success=True,
        )

    async def validate(self, file: UploadFile) -> bool:
        return bool(file and file.filename and file.content_type == "application/pdf")


