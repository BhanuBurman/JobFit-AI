from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class UserCreate(UserBase):
    name: str
    email: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True 