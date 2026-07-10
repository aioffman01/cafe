from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.crud_post import crud_post
from app.crud.crud_comment import crud_comment
from app.schemas.schemas import PostCreate, PostResponse, PostDetailResponse, PostUpdate, CommentCreate, CommentResponse
from app.api import deps
from app.models.models import User

router = APIRouter()


@router.get("", response_model=List[PostResponse])
def read_posts(
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100
) -> Any:
    """
    전체 게시판 목록을 최신 글 순서대로 조회합니다.
    """
    posts = crud_post.get_multi(db, skip=skip, limit=limit)
    # response_model 매핑 시 ORM 모델에서 작성자의 닉네임을 author_nickname 필드로 자동 매핑하기 위함
    for post in posts:
        post.author_nickname = post.author.nickname
    return posts


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    *,
    db: Session = Depends(get_db),
    post_in: PostCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    로그인한 사용자가 새로운 글을 작성합니다.
    """
    post = crud_post.create_with_author(db, obj_in=post_in, author_id=current_user.id)
    post.author_nickname = current_user.nickname
    return post


@router.get("/{post_id}", response_model=PostDetailResponse)
def read_post(*, db: Session = Depends(get_db), post_id: int) -> Any:
    """
    게시글을 상세 조회하고 조회수를 1 증가시킵니다. 해당 글의 댓글 목록도 포함합니다.
    """
    post = crud_post.get(db, id=post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 게시글을 찾을 수 없습니다."
        )
    
    # 조회수 증가
    crud_post.increment_view(db, db_obj=post)
    
    post.author_nickname = post.author.nickname
    
    # 댓글 목록 매핑
    comments = crud_comment.get_by_post(db, post_id=post_id)
    for comment in comments:
        comment.author_nickname = comment.author.nickname
    
    post.comments = comments
    return post


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    *,
    db: Session = Depends(get_db),
    post_id: int,
    post_in: PostUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    작성자 본인 또는 관리자 권한이 있는 사용자가 글을 수정합니다.
    """
    post = crud_post.get(db, id=post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 게시글을 찾을 수 없습니다."
        )
        
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="글을 수정할 권한이 없습니다."
        )
        
    updated_post = crud_post.update(db, db_obj=post, obj_in=post_in)
    updated_post.author_nickname = updated_post.author.nickname
    return updated_post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    *,
    db: Session = Depends(get_db),
    post_id: int,
    current_user: User = Depends(deps.get_current_user)
):
    """
    작성자 본인 또는 관리자 권한이 있는 사용자가 글을 삭제합니다.
    """
    post = crud_post.get(db, id=post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 게시글을 찾을 수 없습니다."
        )
        
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="글을 삭제할 권한이 없습니다."
        )
        
    crud_post.remove(db, id=post_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- 댓글 API 연결부 ---

@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    *,
    db: Session = Depends(get_db),
    post_id: int,
    comment_in: CommentCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    로그인한 사용자가 특정 글에 댓글을 남깁니다.
    """
    post = crud_post.get(db, id=post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다."
        )
        
    comment = crud_comment.create_with_author_and_post(
        db, obj_in=comment_in, author_id=current_user.id, post_id=post_id
    )
    comment.author_nickname = current_user.nickname
    return comment


@router.delete("/{post_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    *,
    db: Session = Depends(get_db),
    post_id: int,
    comment_id: int,
    current_user: User = Depends(deps.get_current_user)
):
    """
    댓글 작성자 본인 또는 관리자만 댓글을 삭제할 수 있습니다.
    """
    comment = crud_comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 댓글을 찾을 수 없습니다."
        )
        
    if comment.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="댓글을 삭제할 권한이 없습니다."
        )
        
    crud_comment.remove(db, id=comment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
