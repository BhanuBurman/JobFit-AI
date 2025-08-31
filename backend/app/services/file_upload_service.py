from fastapi import UploadFile
from typing import Dict, Any
from app.services.base_service import BaseService
from app.constents import UPLOAD_BASE_DIR
import os
from datetime import datetime

from app.schemas.common import FileUploadResponse

class FileUploadService(BaseService):
    def __init__(self):
        super().__init__()

    async def process(self, file: UploadFile) -> Dict[str, Any]:
        if not await self.validate(file):
            return self.format_response(
                message="Invalid file. Please upload a PDF.",
                data=None,
                success=False,
            )

        # Save to relative path (works from any OS/directory)
        contents = await file.read()
        upload_path = UPLOAD_BASE_DIR / file.filename
        os.makedirs(UPLOAD_BASE_DIR, exist_ok=True)
        with open(upload_path, "wb") as f:
            f.write(contents)

        # Return relative path (works everywhere)
        data = FileUploadResponse(
            name=file.filename, 
            path=str(upload_path),  
            size=file.size, 
            created_at=datetime.now()
        )

        return self.format_response(
            message="File uploaded successfully",
            data=data,
            success=True,
        )
    
    async def validate(self, file: UploadFile) -> bool:
        return bool(file and file.filename and file.content_type == "application/pdf")

 


