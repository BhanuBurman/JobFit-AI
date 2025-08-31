from pydantic import BaseModel
from typing import Any, Optional
from app.schemas.common import FileUploadResponse
from app.schemas.common import PDFExtractionResponse
from pydantic import BaseModel

class APIResponse(BaseModel):
    message: str
    success: bool

class FileUplaodAPIResponse(APIResponse):
    data: FileUploadResponse

class PDFExtractionAPIResponse(APIResponse):
    data: PDFExtractionResponse

class PDFExtractionAPIRequest(BaseModel):
    file_path: str

