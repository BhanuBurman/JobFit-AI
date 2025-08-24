from pydantic import BaseModel
from typing import Optional, Any

class MessageResponse(BaseModel):
    message: str

class HealthResponse(BaseModel):
    status: str
    service: str


class PDFUploadResponse(BaseModel):
    filename: str
    pages: int
    full_text: str

class QueryResponse(BaseModel):
    message: str
    query: str 