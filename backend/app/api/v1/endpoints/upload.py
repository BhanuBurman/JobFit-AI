from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.common import PDFUploadResponse
from app.services.pdf_extraction_service import PDFExtractionService
from app.db.vector_store import build_chroma_from_text

router = APIRouter()


@router.post("/upload/pdf", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        service = PDFExtractionService()
        result = await service.process(file)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Invalid file"))

        data = result["data"]
        return PDFUploadResponse(**data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


