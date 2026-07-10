from typing import Any, Dict, Optional, Union
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """
        아이디로 사용자를 조회합니다.
        """
        return db.query(self.model).filter(self.model.username == username).first()

    def get_by_nickname(self, db: Session, *, nickname: str) -> Optional[User]:
        """
        닉네임으로 사용자를 조회합니다.
        """
        return db.query(self.model).filter(self.model.nickname == nickname).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        비밀번호를 해싱하여 새로운 회원을 생성합니다.
        """
        db_obj = User(
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            nickname=obj_in.nickname,
            role="member",  # 기본 가입은 일반 회원(member)으로 지정
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(
        self, db: Session, *, username: str, password: str
    ) -> Optional[User]:
        """
        사용자 아이디와 패스워드로 로그인 인증 처리를 합니다.
        """
        user = self.get_by_username(db, username=username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """
        비밀번호가 전달된 경우 해싱 처리를 한 후 프로필 정보를 수정합니다.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = get_password_hash(update_data["password"])
            del update_data["password"]
            
        return super().update(db, db_obj=db_obj, obj_in=update_data)


crud_user = CRUDUser(User)
