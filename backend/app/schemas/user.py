from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    nickname: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    password: Optional[str] = None

