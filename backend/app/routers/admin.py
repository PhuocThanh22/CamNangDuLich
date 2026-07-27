from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database.database import get_db
from app.models.place import Place as PlaceModel
from app.models.user import User
from app.models.review import Review
from app.schemas.place import PlaceResponse, PlaceUpdate
from app.routers.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    total_places = db.query(func.count(PlaceModel.id)).scalar()
    pending_places = db.query(func.count(PlaceModel.id)).filter(PlaceModel.daduyet == False).scalar()
    total_reviews = db.query(func.count(Review.id)).scalar()
    return {
        "total_users": total_users,
        "total_places": total_places,
        "pending_places": pending_places,
        "total_reviews": total_reviews,
    }


@router.get("/places", response_model=List[PlaceResponse])
def get_all_places(
    pending: bool = False,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(PlaceModel)
    if pending:
        query = query.filter(PlaceModel.daduyet == False)
    query = query.order_by(PlaceModel.id.desc())
    return query.all()


@router.put("/places/{place_id}/approve")
def approve_place(
    place_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Dia diem khong ton tai")
    place.daduyet = True
    place.trangthai = "Mở"
    db.commit()
    return {"message": "Dia diem da duoc duyet", "id": place.id}


@router.delete("/places/{place_id}")
def reject_place(
    place_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Dia diem khong ton tai")
    db.delete(place)
    db.commit()
    return {"message": "Dia diem da bi tu choi", "id": place_id}
