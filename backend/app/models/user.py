from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    nickname = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="member")  # admin, member

    # 관계 정의 (String 기반 바인딩으로 순환 참조 방지)
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="author", cascade="all, delete-orphan")
