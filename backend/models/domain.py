from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    summaries = relationship("SummaryHistory", back_populates="owner")

class SummaryHistory(Base):
    __tablename__ = "summary_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    original_text = Column(Text, nullable=False)
    summary_text = Column(Text, nullable=False)
    method = Column(String, default="abstractive")
    length_setting = Column(String, default="medium")
    compression_ratio = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="summaries")
