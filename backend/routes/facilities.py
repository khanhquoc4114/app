from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Facility, UserFavorite
from auth import verify_token, oauth2_scheme, get_current_user_id

router = APIRouter(prefix="/api/facilities", tags=["Facilities"])

@router.get("/")
def get_facilities(db: Session = Depends(get_db)):
    facilities = db.query(Facility).filter(Facility.is_active == True).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "sport_type": f.sport_type,
            "description": f.description,
            "price_per_hour": f.price_per_hour,
            "image_url": f.image_url,
            "location": f.location,
            "rating": f.rating,
            "reviews_count": f.reviews_count,
            "amenities": f.amenities,
            "opening_hours": f.opening_hours,
            "is_active": f.is_active,
            "created_at": f.created_at,
            "updated_at": f.updated_at
        }
        for f in facilities
    ]

@router.get("/count")
def count_active_facilities(db: Session = Depends(get_db)):
    return {"count": db.query(Facility).filter(Facility.is_active == True).count()}

@router.get("/popular-sports")
def get_popular_sports(db: Session = Depends(get_db)):
    results = (
        db.query(Facility.sport_type, func.count(Facility.id).label("courts"))
        .filter(Facility.is_active == True)
        .group_by(Facility.sport_type)
        .all()
    )
    return [{"sportType": r.sport_type, "courts": r.courts} for r in results]

@router.post("/{facility_id}/favorite")
def add_favorite(
    facility_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    user_id = payload["id"]

    # kiểm tra facility có tồn tại không
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Sân không tồn tại")

    # kiểm tra có favorite rồi chưa
    existing = db.query(UserFavorite).filter_by(user_id=user_id, facility_id=facility_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bạn đã thích sân này rồi")

    # thêm favorite
    new_favorite = UserFavorite(user_id=user_id, facility_id=facility_id)
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    return {"message": "Đã thích sân thành công", "favorite_id": new_favorite.id}

@router.delete("/{facility_id}/favorite")
def remove_favorite(
    facility_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    user_id = payload["id"]

    favorite = db.query(UserFavorite).filter_by(user_id=user_id, facility_id=facility_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Bạn chưa thích sân này")

    db.delete(favorite)
    db.commit()
    return {"message": "Đã bỏ thích sân"}