from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeDetailsBase(BaseModel):
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    resume_text: Optional[str] = None

class ResumeDetailsCreate(ResumeDetailsBase):
    user_id: int

class ResumeDetailsUpdate(ResumeDetailsBase):
    pass

class ResumeDetails(ResumeDetailsBase):
    resume_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
