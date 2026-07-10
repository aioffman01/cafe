from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.models import Comment
from app.schemas.schemas import CommentCreate


class CRUDComment(CRUDBase[Comment, CommentCreate, CommentCreate]):
    def create_with_author_and_post(
        self, db: Session, *, obj_in: CommentCreate, author_id: int, post_id: int
    ) -> Comment:
        """
        특정 게시글(post_id)과 작성자(author_id)를 연동하여 댓글을 등록합니다.
        """
        db_obj = Comment(
            content=obj_in.content,
            author_id=author_id,
            post_id=post_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_post(self, db: Session, *, post_id: int) -> List[Comment]:
        """
        특정 게시글의 댓글 목록을 오래된 순(작성순)으로 가져옵니다.
        """
        return (
            db.query(self.model)
            .filter(self.model.post_id == post_id)
            .order_by(self.model.created_at.asc())
            .all()
        )


crud_comment = CRUDComment(Comment)
