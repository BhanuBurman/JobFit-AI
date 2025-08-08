from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    id: str

class QueryResponse(BaseModel):
    id: str
    query: str
    response: str