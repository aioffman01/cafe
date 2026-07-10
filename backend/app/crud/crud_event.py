from datetime import datetime, timezone
import calendar
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.crud.base import CRUDBase
from app.models.models import Event
from app.schemas.schemas import EventCreate, EventUpdate


class CRUDEvent(CRUDBase[Event, EventCreate, EventUpdate]):
    def create_with_author(
        self, db: Session, *, obj_in: EventCreate, author_id: int, is_admin: bool
    ) -> Event:
        """
        작성자 ID와 역할(관리자 여부)을 파악하여 일정을 등록합니다.
        관리자 계정이 등록한 경우, 자동으로 is_admin_event 플래그가 True가 됩니다.
        """
        db_obj = Event(
            title=obj_in.title,
            description=obj_in.description,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            is_admin_event=is_admin,
            is_all_day=obj_in.is_all_day,
            author_id=author_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_month(self, db: Session, *, year: int, month: int) -> List[Event]:
        """
        해당 년/월 영역에 한 번이라도 겹치는 모든 일정을 조회합니다.
        """
        # 해당 월의 마지막 날짜 구하기
        last_day = calendar.monthrange(year, month)[1]
        
        # 월 시작 일시와 종료 일시 설정 (시간대 미지정 시 단순 비교)
        start_of_month = datetime(year, month, 1, 0, 0, 0)
        end_of_month = datetime(year, month, last_day, 23, 59, 59)
        
        # 일정이 한 달 기간 내에 걸쳐 있는지 필터링
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.start_time <= end_of_month,
                    self.model.end_time >= start_of_month
                )
            )
            .order_by(self.model.start_time.asc())
            .all()
        )


crud_event = CRUDEvent(Event)
