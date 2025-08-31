import os
from pathlib import Path
BASE_ROOT_DIR = os.environ.get("BASE_ROOT_DIR")
UPLOAD_BASE_DIR = Path(BASE_ROOT_DIR) / "uploads"
VECTOR_DB_ROOT_PATH=Path(BASE_ROOT_DIR) / "vector_db"
