from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # 관계 정의 (String 기반 바인딩)
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
