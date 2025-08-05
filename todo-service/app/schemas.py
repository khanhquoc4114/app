from pydantic import BaseModel

class UserInfo(BaseModel):
    user_id: int
    username: str
    
class TodoCreate(BaseModel):
    title: str
    description: str | None = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: str | None

    class Config:
        orm_mode = True
