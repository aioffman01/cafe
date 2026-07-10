from datetime import datetime
from pydantic import BaseModel


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: int
    post_id: int
    author_nickname: str
    created_at: datetime

    class Config:
        from_attributes = True
