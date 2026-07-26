from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    diadiem_id: int
    diemdanhgia: float
    noidung: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    nguoidung_id: int
    diadiem_id: int
    diemdanhgia: float
    noidung: Optional[str] = None
    created_at: Optional[datetime] = None
    nguoidung_ten: Optional[str] = None
    nguoidung_avatar: Optional[str] = None

    model_config = {
        "from_attributes": True,
    }


class ReviewListResponse(BaseModel):
    id: int
    nguoidung_id: int
    diadiem_id: int
    diemdanhgia: float
    noidung: Optional[str] = None
    created_at: Optional[datetime] = None
    nguoidung_ten: Optional[str] = None
    nguoidung_avatar: Optional[str] = None

    model_config = {
        "from_attributes": True,
    }
