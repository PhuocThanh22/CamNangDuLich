from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    ten = Column(String(255), nullable=False, index=True)
    phanloai = Column(String(100), index=True)
    trangthai = Column(String(50), default="Mở")
    huyhieu = Column(String(100), nullable=True)
    vido = Column(Float, nullable=True)
    kinhdo = Column(Float, nullable=True)
    danhgia = Column(String(50), nullable=True)
    diemdanhgia = Column(Float, default=0)
    luotdanhgia = Column(String(50), nullable=True)
    khoangcach = Column(String(50), nullable=True)
    gia = Column(String(100), nullable=True)
    khunggia = Column(String(100), nullable=True)
    giomocua = Column(String(100), nullable=True)
    giohoatdong = Column(String(200), nullable=True)
    hinh = Column(Text, nullable=True)
    danhsachhinh = Column(Text, nullable=True)
    diachi = Column(Text, nullable=True)
    tinh = Column(String(100), nullable=True, index=True)
    dienthoai = Column(String(50), nullable=True)
    mota = Column(Text, nullable=True)
    monan = Column(String(100), nullable=True)
    tienich = Column(String(100), nullable=True)
    trangweb = Column(String(255), nullable=True)
    ladulieu = Column(Boolean, default=True)
    noibat = Column(Boolean, default=False)
    daduyet = Column(Boolean, default=True)
    nguoidung_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(String(50), nullable=True)

    nguoidung = relationship("User", back_populates="diadiem")
    danhgias = relationship("Review", back_populates="place", cascade="all, delete-orphan")
    hinhs = relationship("PlaceImage", back_populates="place", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="place", cascade="all, delete-orphan")
