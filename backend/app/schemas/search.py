from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

class SearchResponse(BaseModel):
    query: str
    limit: int
    results: List[str] 