from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.menu_item import MenuItem as MenuItemModel
from app.models.place import Place as PlaceModel
from app.models.user import User
from app.schemas.menu_item import MenuItemCreate, MenuItemResponse
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/places/{place_id}/menu", tags=["menu"])


def verify_place_owner(place: PlaceModel, user: User):
    if place.nguoidung_id != user.id and user.vaitro != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa địa điểm này")


@router.get("/", response_model=List[MenuItemResponse])
def read_menu_items(place_id: int, db: Session = Depends(get_db)):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return db.query(MenuItemModel).filter(MenuItemModel.diadiem_id == place_id).order_by(MenuItemModel.id).all()


@router.post("/", response_model=MenuItemResponse, status_code=201)
def create_menu_item(
    place_id: int,
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    verify_place_owner(place, user)
    item = MenuItemModel(diadiem_id=place_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_menu_item(
    place_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    verify_place_owner(place, user)
    item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id, MenuItemModel.diadiem_id == place_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(item)
    db.commit()
    return {"message": "Xóa món thành công"}


@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    place_id: int,
    item_id: int,
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    verify_place_owner(place, user)
    item = db.query(MenuItemModel).filter(MenuItemModel.id == item_id, MenuItemModel.diadiem_id == place_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item
