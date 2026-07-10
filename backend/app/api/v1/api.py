from fastapi import APIRouter
from app.api.v1.endpoints import auth, posts, events

api_router = APIRouter()

# v1 통합 라우터 설정 및 기능별 분리 등록
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(posts.router, prefix="/posts", tags=["Board"])
api_router.include_router(events.router, prefix="/events", tags=["Calendar"])
