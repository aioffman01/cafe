import os

# pydantic-settings 패키지가 없을 수도 있으므로, 단순 환경설정 클래스나 Pydantic BaseSettings를 혼용하거나
# 일반 클래스로 구성하는 것이 안전할 수 있습니다. 여기서는 표준 Pydantic 클래스 혹은 단순 클래스로 구성합니다.

class Settings:
    PROJECT_NAME: str = "Cafe Moim API"
    API_V1_STR: str = "/api/v1"
    
    # JWT 보안 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # 데이터베이스 설정 (SQLite 기본값, 필요시 환경변수로 MySQL 전환 가능)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

settings = Settings()
