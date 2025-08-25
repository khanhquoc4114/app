from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Facility, UserFavorite, User
from auth import verify_token, oauth2_scheme, get_current_user
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/facilities", tags=["Facilities"])


class CourtLayout(BaseModel):
    rows: int
    cols: int
    total_courts: int

class FacilityCreate(BaseModel):
    name: str
    sport_type: List[str]
    description: str
    price_per_hour: float
    location: str
    amenities: Optional[List[str]] = []
    opening_hours: str
    court_layout: Optional[CourtLayout] = None
    image_url: Optional[str] = None
    is_active: bool = True

class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    sport_type: Optional[List[str]] = None
    description: Optional[str] = None
    price_per_hour: Optional[float] = None
    location: Optional[str] = None
    amenities: Optional[List[str]] = None
    opening_hours: Optional[str] = None
    court_layout: Optional[CourtLayout] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class FacilityResponse(BaseModel):
    id: int
    name: str
    owner_user_id: int
    sport_type: List[str]
    court_layout: Optional[dict] = None
    description: str
    price_per_hour: float
    image_url: Optional[str] = None
    location: str
    rating: float
    reviews_count: int
    amenities: List[str]
    opening_hours: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("/")
def get_facilities(db: Session = Depends(get_db)):
    facilities = db.query(Facility).filter(Facility.is_active == True).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "sport_type": f.sport_type,
            "court_layout": f.court_layout,  
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

@router.post("/", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
async def create_facility(
    facility_data: FacilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tạo sân mới - chỉ user có role 'host' hoặc 'admin' mới được tạo
    """
    # Kiểm tra quyền tạo sân
    if current_user.role not in ["host", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ sân hoặc admin mới có thể tạo sân mới"
        )
    
    # Tạo facility mới
    new_facility = Facility(
        name=facility_data.name,
        owner_user_id=current_user.id,
        sport_type=facility_data.sport_type,
        court_layout= facility_data.court_layout.dict() if facility_data.court_layout else None,
        description=facility_data.description,
        price_per_hour=facility_data.price_per_hour,
        image_url=facility_data.image_url,
        location=facility_data.location,
        amenities=facility_data.amenities,
        opening_hours=facility_data.opening_hours,
        is_active=facility_data.is_active
    )
    
    try:
        db.add(new_facility)
        db.commit()
        db.refresh(new_facility)
        
        return new_facility
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo sân: {str(e)}"
        )

@router.put("/{facility_id}", response_model=FacilityResponse)
async def update_facility(
    facility_id: int,
    facility_data: FacilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cập nhật thông tin sân
    """
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sân"
        )
    
    # Kiểm tra quyền sửa
    if facility.owner_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền sửa sân này"
        )
    
    # Cập nhật các field
    update_data = facility_data.dict(exclude_unset=True)
    if "court_layout" in update_data and update_data["court_layout"]:
        update_data["court_layout"] = update_data["court_layout"]
    
    for field, value in update_data.items():
        setattr(facility, field, value)
    
    try:
        db.commit()
        db.refresh(facility)
        return facility
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật sân: {str(e)}"
        )

@router.delete("/{facility_id}")
async def delete_facility(
    facility_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Xóa sân
    """
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sân"
        )
    
    # Kiểm tra quyền xóa
    if facility.owner_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa sân này"
        )
    
    try:
        db.delete(facility)
        db.commit()
        return {"message": "Xóa sân thành công"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xóa sân: {str(e)}"
        )

@router.patch("/{facility_id}/status")
async def update_facility_status(
    facility_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cập nhật trạng thái sân (hoạt động/tạm ngưng)
    """
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sân"
        )
    
    # Kiểm tra quyền
    if facility.owner_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thay đổi trạng thái sân này"
        )
    
    facility.is_active = is_active
    
    try:
        db.commit()
        return {"message": "Cập nhật trạng thái thành công", "is_active": is_active}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật trạng thái: {str(e)}"
        )

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
        "court_layout": facility.court_layout,
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
        "owner_user_id": facility.owner_user_id,
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

