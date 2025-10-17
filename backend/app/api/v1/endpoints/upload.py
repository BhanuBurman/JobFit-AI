from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.api import FileUplaodAPIResponse
from app.services.file_upload_service import FileUploadService
from app.services.pdf_extraction_service import PDFExtractionService
from app.core.database import get_db
from app.db.models import ResumeDetails, User as UserModel
from app.services.auth_service import get_current_user
from app.schemas.user import User as UserSchema

router = APIRouter()

file_service = FileUploadService()
pdf_service = PDFExtractionService()

@router.post("/upload/pdf", response_model=FileUplaodAPIResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Step 1: Upload and save file
        upload_result = await file_service.process(file)

        if not upload_result.get("success"):
            raise HTTPException(status_code=400, detail=upload_result.get("message", "Invalid file"))

        file_path = upload_result["data"].path

        # Step 2: Extract text from PDF
        pdf_result = await pdf_service.process(file_path)

        if not pdf_result.get("success"):
            raise HTTPException(status_code=400, detail=pdf_result.get("message", "Error extracting PDF text"))

        extracted_text = pdf_result["data"].full_text

        # Step 3: Create resume record in database
        db_resume = ResumeDetails(
            user_id=current_user.id,
            file_name=file.filename,
            file_path=file_path,
            resume_text=extracted_text
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        # Step 4: Return combined result
        return {
            "message": "PDF uploaded, processed, and resume created successfully",
            "success": True,
            "data": {
                "name": file.filename,
                "path": file_path,
                "size": file.size,
                "created_at": upload_result["data"].created_at,
                "resume_id": db_resume.resume_id,
                "pages_processed": pdf_result["data"].pages,
                "text_length": len(extracted_text),
                "resume_text": extracted_text  # Add full text to response
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


