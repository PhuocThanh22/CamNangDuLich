from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.review import Review
from app.models.place import Place as PlaceModel
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("/place/{place_id}", response_model=List[ReviewResponse])
def get_reviews_by_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(PlaceModel).filter(PlaceModel.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Dia diem khong ton tai")

    reviews = (
        db.query(Review)
        .filter(Review.diadiem_id == place_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    result = []
    for r in reviews:
        review_data = ReviewResponse(
            id=r.id,
            nguoidung_id=r.nguoidung_id,
            diadiem_id=r.diadiem_id,
            diemdanhgia=r.diemdanhgia,
            noidung=r.noidung,
            created_at=r.created_at,
            nguoidung_ten=r.user.ten if r.user else None,
            nguoidung_avatar=r.user.avatar if r.user else None,
        )
        result.append(review_data)
    return result


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    place = db.query(PlaceModel).filter(PlaceModel.id == data.diadiem_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Dia diem khong ton tai")

    if data.diemdanhgia < 1 or data.diemdanhgia > 5:
        raise HTTPException(status_code=400, detail="Diem danh gia tu 1 den 5")

    review = Review(
        nguoidung_id=user.id,
        diadiem_id=data.diadiem_id,
        diemdanhgia=data.diemdanhgia,
        noidung=data.noidung,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    avg = db.query(Review).filter(Review.diadiem_id == data.diadiem_id).all()
    avg_score = round(sum(r.diemdanhgia for r in avg) / len(avg), 1)
    place.diemdanhgia = avg_score
    place.danhgia = f"{avg_score} ({len(avg)} danh gia)"
    place.luotdanhgia = f"{len(avg)} danh gia"
    db.commit()

    return ReviewResponse(
        id=review.id,
        nguoidung_id=review.nguoidung_id,
        diadiem_id=review.diadiem_id,
        diemdanhgia=review.diemdanhgia,
        noidung=review.noidung,
        created_at=review.created_at,
        nguoidung_ten=user.ten,
        nguoidung_avatar=user.avatar,
    )


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Danh gia khong ton tai")
    if review.nguoidung_id != user.id and user.vaitro != "admin":
        raise HTTPException(status_code=403, detail="Khong co quyen xoa")

    db.delete(review)
    db.commit()
    return {"message": "Da xoa danh gia"}
