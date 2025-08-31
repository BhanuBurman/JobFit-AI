from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.api import PDFExtractionAPIResponse, PDFExtractionAPIRequest
from app.services.pdf_extraction_service import PDFExtractionService

router = APIRouter()

service = PDFExtractionService()

@router.post("/extract/pdf", response_model=PDFExtractionAPIResponse)
async def extract_pdf(file_path: PDFExtractionAPIRequest):
    try:
        result = await service.process(file_path.file_path)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Invalid file"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


