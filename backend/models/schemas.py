from pydantic import BaseModel, Field
from typing import Optional, List

# Basic Text Summarization Request & Response
class SummarizeRequest(BaseModel):
    text: str = Field(..., description="The main text to summarize", min_length=50)
    length: str = Field("medium", description="Length of the summary: short, medium, long")
    method: str = Field("abstractive", description="Method: extractive or abstractive")

class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    compression_ratio: float
    key_sentences: Optional[List[str]] = []

# URL Scraping Request
class UrlSummarizeRequest(BaseModel):
    url: str = Field(..., description="The URL of the article to scrape and summarize")
    length: str = Field("medium", description="Length of the summary: short, medium, long")

# Smart Study Mode Response
class SmartStudyResponse(BaseModel):
    summary: str
    key_points: List[str]
    exam_revision_notes: List[str]
    original_length: int

# Authentication
class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    email: str
    id: int

# Dashboard History
class SummaryHistoryResponse(BaseModel):
    id: int
    original_text: str
    summary_text: str
    method: str
    length_setting: str
    compression_ratio: float
    created_at: str

