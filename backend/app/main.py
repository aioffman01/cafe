from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router

# SQLite 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS 설정 (프론트엔드 연결 대비)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 로컬 개발 목적이므로 임시 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 라우터 등록
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def create_admin_user():
    from app.core.database import SessionLocal
    from app.models.models import User
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash("password123"),
                nickname="카페관리자",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("★ Default admin user auto-created: admin / password123")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}!"}
