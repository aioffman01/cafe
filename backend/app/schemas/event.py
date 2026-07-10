from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_all_day: bool = False


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_all_day: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    is_admin_event: bool
    author_nickname: str

    class Config:
        from_attributes = True
