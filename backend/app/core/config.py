import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Backend root path - defaults to current directory if not set
    BACKEND_ROOT: str = str(Path(__file__).parent.parent.parent)
    
    # Upload directory - will be created inside backend folder
    UPLOAD_DIR: str = "uploads"
    
    # Full upload path
    @property
    def UPLOAD_BASE_DIR(self) -> Path:
        return Path(self.BACKEND_ROOT) / self.UPLOAD_DIR
    
    # Ensure upload directory exists
    def ensure_upload_dir(self):
        os.makedirs(self.UPLOAD_BASE_DIR, exist_ok=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create global settings instance
settings = Settings()