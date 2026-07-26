from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    diadiem_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    ten = Column(String(255), nullable=False)
    gia = Column(String(100), nullable=True)
    mota = Column(Text, nullable=True)
    hinh = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    place = relationship("Place", back_populates="menu_items")
