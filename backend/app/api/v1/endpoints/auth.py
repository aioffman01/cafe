from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.crud_user import crud_user
from app.schemas.schemas import UserCreate, UserResponse, UserLogin, Token, UserUpdate
from app.core.security import create_access_token
from app.api import deps
from app.models.models import User

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(*, db: Session = Depends(get_db), user_in: UserCreate) -> Any:
    """
    새로운 카페 회원을 등록합니다.
    """
    user = crud_user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 아이디입니다.",
        )
    user = crud_user.get_by_nickname(db, nickname=user_in.nickname)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 닉네임입니다.",
        )
    return crud_user.create(db, obj_in=user_in)


@router.post("/login", response_model=Token)
def login(*, db: Session = Depends(get_db), login_in: UserLogin) -> Any:
    """
    아이디와 비밀번호로 검증 후 JWT Access Token을 발급합니다.
    """
    user = crud_user.authenticate(
        db, username=login_in.username, password=login_in.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 혹은 비밀번호가 일치하지 않습니다.",
        )
    return {
        "access_token": create_access_token(subject=user.id, role=user.role),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    현재 로그인된 본인의 회원 프로필 정보를 조회합니다.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    로그인한 회원이 본인의 프로필 정보를 수정합니다. (닉네임 중복 방지 체크 포함)
    """
    if user_in.nickname and user_in.nickname != current_user.nickname:
        existing_user = crud_user.get_by_nickname(db, nickname=user_in.nickname)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 닉네임입니다.",
            )
            
    return crud_user.update(db, db_obj=current_user, obj_in=user_in)


@router.get("/users", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    관리자 권한이 있는 경우 가입된 모든 회원 목록을 조회합니다.
    """
    return crud_user.get_multi(db, skip=skip, limit=limit)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_admin: User = Depends(deps.get_current_active_admin),
):
    """
    관리자 권한이 있는 경우 회원을 강제 탈퇴시킵니다. (자기 자신 강퇴 방지 포함)
    """
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="관리자 본인을 목록에서 삭제할 수 없습니다.",
        )
        
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 사용자를 찾을 수 없습니다.",
        )
        
    crud_user.remove(db, id=user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
