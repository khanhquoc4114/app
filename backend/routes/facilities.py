from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Facility

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

# API lấy chi tiết sân theo id
@router.get("/{facility_id}")
def get_facility_detail(facility_id: int, db: Session = Depends(get_db)):
    facility = db.query(Facility).filter(Facility.id == facility_id, Facility.is_active == True).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return {
        "id": facility.id,
        "name": facility.name,
        "sport_type": facility.sport_type,
        "description": facility.description,
        "price_per_hour": facility.price_per_hour,
        "image_url": facility.image_url,
        "location": facility.location,
        "rating": facility.rating,
        "reviews_count": facility.reviews_count,
        "amenities": facility.amenities,
        "opening_hours": facility.opening_hours,
        "is_active": facility.is_active,
        "created_at": facility.created_at,
        "updated_at": facility.updated_at,
        "owner_id": facility.owner_user_id,
    }

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
