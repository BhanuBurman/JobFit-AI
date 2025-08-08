from pydantic import BaseModel
from typing import Dict, Any

class ItemCreate(BaseModel):
    item: Dict[str, Any] 