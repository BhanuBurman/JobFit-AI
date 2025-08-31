import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Upload directory relative to backend root
    UPLOAD_DIR: str = "uploads"
    
    # Get upload path relative to current working directory (backend/)
    @property
    def UPLOAD_BASE_DIR(self) -> str:
        return self.UPLOAD_DIR
    
    # Ensure upload directory exists
    def ensure_upload_dir(self):
        os.makedirs(self.UPLOAD_BASE_DIR, exist_ok=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create global settings instance
settings = Settings()