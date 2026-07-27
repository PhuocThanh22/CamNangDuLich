from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional

from app.database.database import get_db
from app.models.place import Place as PlaceModel
from app.models.favorite import Favorite
from app.models.place_image import PlaceImage
from app.models.user import User
from app.schemas.place import PlaceCreate, PlaceUpdate, PlaceResponse
from app.schemas.place_image import PlaceImageCreate, PlaceImageResponse
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/places", tags=["places"])


@router.get("/", response_model=List[PlaceResponse])
def read_places(
    skip: int = 0,
    limit: int = 10000,
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(PlaceModel).filter(PlaceModel.daduyet == True)

    if search:
        query = query.filter(
            or_(
                PlaceModel.ten.ilike(f"%{search}%"),
                PlaceModel.monan.ilike(f"%{search}%"),
                PlaceModel.phanloai.ilike(f"%{search}%"),
                PlaceModel.diachi.ilike(f"%{search}%"),
            )
        )

    if category and category != "all":
        query = query.filter(PlaceModel.phanloai == category)

    if featured is not None:
        query = query.filter(PlaceModel.noibat == featured)

    if sort_by == "rating":
        query = query.order_by(PlaceModel.diemdanhgia.desc())
    elif sort_by == "name":
        query = query.order_by(PlaceModel.ten.asc())
    else:
        query = query.order_by(PlaceModel.id.desc())

    places = query.offset(skip).limit(limit).all()
    return places


@router.get("/categories", response_model=List[dict])
def read_categories(db: Session = Depends(get_db)):
    results = (
        db.query(
            PlaceModel.phanloai,
            func.count(PlaceModel.id).label("count"),
        )
        .filter(PlaceModel.phanloai.isnot(None))
        .group_by(PlaceModel.phanloai)
        .all()
    )
    return [{"title": r.phanloai, "count": r.count} for r in results]


@router.get("/nearby", response_model=List[PlaceResponse])
def read_nearby(
    lat: float = Query(21.028),
    lng: float = Query(105.854),
    radius_km: float = 2.0,
    limit: int = 50,
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    haversine = (
        6371 * func.acos(
            func.cos(func.radians(lat))
            * func.cos(func.radians(PlaceModel.vido))
            * func.cos(func.radians(PlaceModel.kinhdo) - func.radians(lng))
            + func.sin(func.radians(lat)) * func.sin(func.radians(PlaceModel.vido))
        )
    )
    query = db.query(PlaceModel).filter(
        PlaceModel.vido.isnot(None),
        PlaceModel.kinhdo.isnot(None),
        PlaceModel.daduyet == True,
        haversine < radius_km,
    )
    if category and category != "all":
        query = query.filter(
            or_(PlaceModel.phanloai == category, PlaceModel.monan == category)
        )
    places = query.order_by(haversine).limit(limit).all()
    return places


@router.get("/cua-toi", response_model=List[PlaceResponse])
def get_my_places(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    places = db.query(PlaceModel).filter(PlaceModel.nguoidung_id == user.id).order_by(PlaceModel.id.desc()).all()
    return places


@router.get("/yeu-thich", response_model=List[PlaceResponse])
def get_favorites(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    place_ids = [f.diadiem_id for f in db.query(Favorite).filter(Favorite.nguoidung_id == user.id).all()]
    places = db.query(PlaceModel).filter(PlaceModel.id.in_(place_ids)).all() if place_ids else []
    return places


@router.post("/{place_id}/yeu-thich")
def toggle_favorite(place_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Dia diem khong ton tai")
    existing = db.query(Favorite).filter(Favorite.nguoidung_id == user.id, Favorite.diadiem_id == place_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"yeuthich": False, "message": "Da bo yeu thich"}
    fav = Favorite(nguoidung_id=user.id, diadiem_id=place_id)
    db.add(fav)
    db.commit()
    return {"yeuthich": True, "message": "Da them vao yeu thich"}


@router.get("/{place_id}/images", response_model=List[PlaceImageResponse])
def read_place_images(place_id: int, db: Session = Depends(get_db)):
    return db.query(PlaceImage).filter(PlaceImage.diadiem_id == place_id).order_by(PlaceImage.id).all()


@router.post("/{place_id}/images", response_model=PlaceImageResponse, status_code=201)
def create_place_image(
    place_id: int,
    data: PlaceImageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    img = PlaceImage(diadiem_id=place_id, url=data.url, alt=data.alt)
    db.add(img)
    db.commit()
    db.refresh(img)
    return img


@router.delete("/{place_id}/images/{image_id}")
def delete_place_image(
    place_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    img = db.query(PlaceImage).filter(PlaceImage.id == image_id, PlaceImage.diadiem_id == place_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(img)
    db.commit()
    return {"message": "Image deleted successfully"}


@router.get("/{place_id}", response_model=PlaceResponse)
def read_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.post("/", response_model=PlaceResponse, status_code=201)
def create_place(
    place: PlaceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = place.model_dump()
    data["daduyet"] = user.vaitro == "admin"
    db_place = PlaceModel(**data, nguoidung_id=user.id)
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place


@router.put("/{place_id}", response_model=PlaceResponse)
def update_place(place_id: int, place: PlaceUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    db_place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    update_data = place.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_place, key, value)

    db.commit()
    db.refresh(db_place)
    return db_place


@router.delete("/{place_id}")
def delete_place(place_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    db.delete(place)
    db.commit()
    return {"message": "Place deleted successfully"}
