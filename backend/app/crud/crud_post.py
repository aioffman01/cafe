from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.models import Post
from app.schemas.schemas import PostCreate, PostUpdate


class CRUDPost(CRUDBase[Post, PostCreate, PostUpdate]):
    def create_with_author(
        self, db: Session, *, obj_in: PostCreate, author_id: int
    ) -> Post:
        """
        작성자 ID(회원 식별번호)를 연동하여 글을 등록합니다.
        """
        db_obj = Post(
            title=obj_in.title,
            content=obj_in.content,
            author_id=author_id,
            view_count=0
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Post]:
        """
        최신글 순서(created_at desc)로 정렬하여 조회합니다.
        """
        return (
            db.query(self.model)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def increment_view(self, db: Session, *, db_obj: Post) -> Post:
        """
        상세 보기 시 조회수를 1 증가시킵니다.
        """
        db_obj.view_count += 1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_post = CRUDPost(Post)
