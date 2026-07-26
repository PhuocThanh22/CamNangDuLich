from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    nguoidung_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    diadiem_id = Column(Integer, ForeignKey("places.id"), nullable=False)

    user = relationship("User", back_populates="yeuthich")
    place = relationship("Place")

    __table_args__ = (UniqueConstraint("nguoidung_id", "diadiem_id", name="unique_user_place"),)
