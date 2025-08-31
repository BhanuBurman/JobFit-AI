from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class MessageResponse(BaseModel):
    message: str

class HealthResponse(BaseModel):
    status: str
    service: str


class FileUploadResponse(BaseModel):
    name:str
    path: str # TODO: need to remove this path instead use file name
    size:int
    created_at:datetime


class PDFExtractionResponse(BaseModel):
    collection_name: str
    pages: int
    full_text: str

class QueryResponse(BaseModel):
    message: str
    query: str 