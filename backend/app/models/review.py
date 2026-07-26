from sqlalchemy import Column, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    nguoidung_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    diadiem_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    diemdanhgia = Column(Float, default=5.0)
    noidung = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="danhgia")
    place = relationship("Place", back_populates="danhgias")
