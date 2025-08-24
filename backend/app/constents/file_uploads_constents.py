from app.core.config import settings

# Get paths from config
ROOT_DIR = settings.BACKEND_ROOT
UPLOAD_BASE_DIR = str(settings.UPLOAD_BASE_DIR)

# Ensure upload directory exists
settings.ensure_upload_dir()