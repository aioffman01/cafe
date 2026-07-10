from typing import Generator
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.crud.crud_user import crud_user
from app.models.models import User
from app.schemas.schemas import TokenPayload

# OAuth2PasswordBearer를 이용해 Bearer 토큰 추출 자동화
# API 경로가 /api/v1/auth/login 이지만 여기서는 단순 보안 헤더 검사용으로 등록합니다.
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    """
    HTTP 요청의 Authorization 헤더에서 JWT를 추출해 유효성을 검사하고 사용자 객체를 반환합니다.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="인증 토큰이 올바르지 않거나 만료되었습니다.",
        )
        
    user = crud_user.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )
    return user


def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    현재 사용자가 관리자(admin) 권한인지 확인합니다.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 작업을 수행하기 위한 관리자 권한이 없습니다."
        )
    return current_user
