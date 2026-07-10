from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.comment import CommentResponse


class PostBase(BaseModel):
    title: str
    content: str


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    title: str
    author_nickname: str
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class PostDetailResponse(PostResponse):
    content: str
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True
