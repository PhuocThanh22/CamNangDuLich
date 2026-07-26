from pydantic import BaseModel, Field
from typing import Optional


class PlaceBase(BaseModel):
    ten: str
    phanloai: str
    trangthai: Optional[str] = "Mở"
    huyhieu: Optional[str] = None
    vido: Optional[float] = None
    kinhdo: Optional[float] = None
    danhgia: Optional[str] = None
    diemdanhgia: Optional[float] = 0
    luotdanhgia: Optional[str] = None
    khoangcach: Optional[str] = None
    gia: Optional[str] = None
    khunggia: Optional[str] = None
    giomocua: Optional[str] = None
    giohoatdong: Optional[str] = None
    hinh: Optional[str] = None
    danhsachhinh: Optional[str] = None
    diachi: Optional[str] = None
    dienthoai: Optional[str] = None
    mota: Optional[str] = None
    monan: Optional[str] = None
    tienich: Optional[str] = None
    trangweb: Optional[str] = None
    ladulieu: Optional[bool] = True
    noibat: Optional[bool] = False


class PlaceCreate(PlaceBase):
    pass


class PlaceUpdate(BaseModel):
    ten: Optional[str] = None
    phanloai: Optional[str] = None
    trangthai: Optional[str] = None
    huyhieu: Optional[str] = None
    vido: Optional[float] = None
    kinhdo: Optional[float] = None
    danhgia: Optional[str] = None
    diemdanhgia: Optional[float] = None
    luotdanhgia: Optional[str] = None
    khoangcach: Optional[str] = None
    gia: Optional[str] = None
    khunggia: Optional[str] = None
    giomocua: Optional[str] = None
    giohoatdong: Optional[str] = None
    hinh: Optional[str] = None
    danhsachhinh: Optional[str] = None
    diachi: Optional[str] = None
    dienthoai: Optional[str] = None
    mota: Optional[str] = None
    monan: Optional[str] = None
    tienich: Optional[str] = None
    trangweb: Optional[str] = None
    noibat: Optional[bool] = None


class PlaceResponse(PlaceBase):
    id: int
    nguoidung_id: Optional[int] = None

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }
