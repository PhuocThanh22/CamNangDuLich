from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    ten = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    matkhau = Column(String(200), nullable=False)
    vaitro = Column(String(20), default="user")
    avatar = Column(Text, nullable=True)
    created_at = Column(String(50), nullable=True)

    yeuthich = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    diadiem = relationship("Place", back_populates="nguoidung", cascade="all, delete-orphan")
    danhgia = relationship("Review", back_populates="user", cascade="all, delete-orphan")
