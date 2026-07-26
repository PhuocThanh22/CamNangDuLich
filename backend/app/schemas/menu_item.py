from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MenuItemCreate(BaseModel):
    ten: str
    gia: Optional[str] = None
    mota: Optional[str] = None
    hinh: Optional[str] = None


class MenuItemResponse(BaseModel):
    id: int
    diadiem_id: int
    ten: str
    gia: Optional[str] = None
    mota: Optional[str] = None
    hinh: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
    }
