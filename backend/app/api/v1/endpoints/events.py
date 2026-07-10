from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.crud_event import crud_event
from app.schemas.schemas import EventCreate, EventResponse, EventUpdate
from app.api import deps
from app.models.models import User

router = APIRouter()


@router.get("", response_model=List[EventResponse])
def read_events(
    *,
    db: Session = Depends(get_db),
    year: int,
    month: int
) -> Any:
    """
    특정 년/월에 해당하는 캘린더 일정을 조회합니다.
    """
    events = crud_event.get_by_month(db, year=year, month=month)
    for event in events:
        event.author_nickname = event.author.nickname
    return events


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: EventCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    로그인한 회원이 캘린더 일정을 등록합니다. 
    사용자가 관리자(admin) 권한인 경우 is_admin_event 플래그가 True로 등록됩니다.
    """
    is_admin = (current_user.role == "admin")
    event = crud_event.create_with_author(
        db, obj_in=event_in, author_id=current_user.id, is_admin=is_admin
    )
    event.author_nickname = current_user.nickname
    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    작성자 본인 또는 관리자가 일정을 수정합니다.
    """
    event = crud_event.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 일정을 찾을 수 없습니다."
        )
        
    if event.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="일정을 수정할 권한이 없습니다."
        )
        
    updated_event = crud_event.update(db, db_obj=event, obj_in=event_in)
    updated_event.author_nickname = updated_event.author.nickname
    return updated_event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: User = Depends(deps.get_current_user)
):
    """
    작성자 본인 또는 관리자가 일정을 삭제합니다.
    """
    event = crud_event.get(db, id=event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 일정을 찾을 수 없습니다."
        )
        
    if event.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="일정을 삭제할 권한이 없습니다."
        )
        
    crud_event.remove(db, id=event_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
