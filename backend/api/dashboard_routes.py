from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db
from models.domain import User, SummaryHistory
from api.auth import get_current_user
from models.schemas import SummaryHistoryResponse
from pydantic import BaseModel

router = APIRouter()

class SaveSummaryRequest(BaseModel):
    original_text: str
    summary_text: str
    method: str = "abstractive"
    length_setting: str = "medium"
    compression_ratio: float

@router.post("/save", response_model=SummaryHistoryResponse)
def save_summary(
    request: SaveSummaryRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history_entry = SummaryHistory(
        user_id=current_user.id,
        original_text=request.original_text,
        summary_text=request.summary_text,
        method=request.method,
        length_setting=request.length_setting,
        compression_ratio=request.compression_ratio
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    
    # Format dates to string
    response_data = history_entry.__dict__.copy()
    response_data["created_at"] = response_data["created_at"].isoformat()
    return response_data

@router.get("/history", response_model=List[SummaryHistoryResponse])
def get_user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    histories = db.query(SummaryHistory).filter(SummaryHistory.user_id == current_user.id).order_by(SummaryHistory.created_at.desc()).all()
    
    result = []
    for h in histories:
        data = h.__dict__.copy()
        data["created_at"] = data["created_at"].isoformat()
        result.append(data)
        
    return result

@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history_item = db.query(SummaryHistory).filter(SummaryHistory.id == history_id, SummaryHistory.user_id == current_user.id).first()
    if not history_item:
        raise HTTPException(status_code=404, detail="History item not found")
        
    db.delete(history_item)
    db.commit()
    return {"status": "success", "message": "Item deleted"}
