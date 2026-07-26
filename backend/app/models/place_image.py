from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base


class PlaceImage(Base):
    __tablename__ = "place_images"

    id = Column(Integer, primary_key=True, index=True)
    diadiem_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    url = Column(Text, nullable=False)
    alt = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    place = relationship("Place", back_populates="hinhs")
