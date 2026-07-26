from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlaceImageCreate(BaseModel):
    url: str
    alt: Optional[str] = None


class PlaceImageResponse(BaseModel):
    id: int
    diadiem_id: int
    url: str
    alt: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
    }
