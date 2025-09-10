from datetime import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, Request, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models import Facility, UserFavorite, Booking, User
from auth import verify_token, oauth2_scheme, get_current_user
from typing import Annotated, List, Optional, Union, Dict
from pydantic import BaseModel, Field, ConfigDict
import json
from utils import save_file

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
    cover_image: Optional[str] = None
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
    cover_image: Optional[str] = None
    is_active: Optional[bool] = None


class FacilityStats(BaseModel):
    id: int
    name: str
    sport_type: list[str] | str
    price_per_hour: float
    status: str
    bookings_count: int
    revenue: float
    owner_id: int | None

@router.get("/stats", response_model=list[FacilityStats])
def get_facilities_stats(db: Session = Depends(get_db)):
    facilities = (
        db.query(
            Facility.id,
            Facility.name,
            Facility.sport_type,
            Facility.price_per_hour,
            Facility.status,
            func.count(Booking.id).label("bookings_count"),
            func.coalesce(func.sum(Booking.total_price), 0).label("revenue"),
            Facility.owner_id
        )
        .outerjoin(Booking, Facility.id == Booking.facility_id)
        .group_by(Facility.id)
        .all()
    )
    return facilities

@router.get("/host")
def get_facilities_for_host(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    owner_id = payload["id"]

    today = datetime.today().date()
    now = datetime.today()

    facilities = db.query(Facility).filter(Facility.owner_id == owner_id).all()

    result = []
    for f in facilities:
        bookings_today = (
            db.query(func.count(Booking.id))
            .filter(Booking.facility_id == f.id)
            .filter(func.date(Booking.start_time) == today)
            .scalar()
        )

        revenue_today = (
            db.query(func.coalesce(func.sum(Booking.total_price), 0))
            .filter(Booking.facility_id == f.id)
            .filter(func.date(Booking.start_time) == today)
            .scalar()
        )

        bookings_this_month = (
            db.query(func.count(Booking.id))
            .filter(Booking.facility_id == f.id)
            .filter(extract("month", Booking.start_time) == now.month)
            .filter(extract("year", Booking.start_time) == now.year)
            .scalar()
        )

        revenue_this_month = (
            db.query(func.coalesce(func.sum(Booking.total_price), 0))
            .filter(Booking.facility_id == f.id)
            .filter(extract("month", Booking.start_time) == now.month)
            .filter(extract("year", Booking.start_time) == now.year)
            .scalar()
        )

        result.append({
            "id": f.id,
            "name": f.name,
            "sport_type": f.sport_type,
            "description": f.description,
            "price_per_hour": f.price_per_hour,
            "cover_image": f.cover_image,
            "location": f.location,
            "rating": f.rating,
            "reviews_count": f.reviews_count,
            "amenities": f.amenities,
            "opening_hours": f.opening_hours,
            "is_active": f.is_active,
            "court_layout": f.court_layout,
            "bookings_today": bookings_today,
            "revenue_today": revenue_today,
            "bookings_this_month": bookings_this_month,
            "revenue_this_month": revenue_this_month,
        })

    return result

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
            "cover_image": f.cover_image,
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

class CourtLayoutItem(BaseModel):
    sport_type: str
    court_counts: int

class FacilityResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    sport_type: List[str]
    court_layout: Optional[List[CourtLayoutItem]] = None  
    description: Optional[str] = None               
    price_per_hour: float
    cover_image: Optional[str] = None
    location: Optional[str] = None                  
    rating: float
    reviews_count: int
    amenities: List[str] = []                       
    opening_hours: Optional[str] = None            
    is_active: bool
    images: List[str] = Field(default_factory=list)

    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

@router.post("/", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
async def create_facility_with_upload(
    request: Request,  # ✅ Thêm Request để access raw form data
    name: str = Form(...),
    sport_type: str = Form(...),              
    description: Optional[str] = Form(None),
    price_per_hour: float = Form(...),
    location: Optional[str] = Form(None),
    amenities: Optional[str] = Form(None),
    opening_hours: Optional[str] = Form(None),
    court_layout: Optional[str] = Form(None), 
    cover_image: Optional[UploadFile] = File(None),          
    # ✅ Bỏ facility_images parameter, sẽ lấy từ request

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["host", "admin"]:
        raise HTTPException(status_code=403, detail="Chỉ chủ sân hoặc admin mới có thể tạo sân")

    # ✅ Lấy tất cả facility_images từ raw form data
    form_data = await request.form()
    facility_images_list: List[UploadFile] = []
    
    # Lấy tất cả files có key là 'facility_images'
    for key, value in form_data.multi_items():
        if key == 'facility_images' and hasattr(value, 'filename'):
            facility_images_list.append(value)
    
    print(f"Found {len(facility_images_list)} facility_images")
    for i, img in enumerate(facility_images_list):
        print(f"Image {i}: filename={img.filename}, size={img.size}")

    sport_type_list = [s.strip() for s in sport_type.split(",") if s.strip()]
    amenities_list = [s.strip() for s in amenities.split(",")] if amenities else []
    court_layout_obj = json.loads(court_layout) if court_layout else None

    cover_path: Optional[str] = None
    if cover_image:
        saved = await save_file(cover_image)
        cover_path = os.path.join("uploads", os.path.basename(saved))

    # Process facility_images
    images_paths: List[str] = []
    for i, f in enumerate(facility_images_list):
        print(f"Saving image {i}: {f.filename}")
        saved = await save_file(f)
        path = os.path.join("uploads", os.path.basename(saved))
        images_paths.append(path)
        print(f"Saved image {i} to: {path}")

    print(f"Total images saved: {len(images_paths)}")

    if not cover_path and images_paths:
        cover_path = images_paths[0]

    images_str = json.dumps(images_paths) if images_paths else None

    new_facility = Facility(
        name=name,
        owner_id=current_user.id,
        sport_type=sport_type_list,
        court_layout=court_layout_obj,
        description=description,
        price_per_hour=price_per_hour,
        cover_image=cover_path,
        location=location,
        amenities=amenities_list,
        opening_hours=opening_hours,
        images=images_str,
    )

    try:
        db.add(new_facility)
        db.commit()
        db.refresh(new_facility)
        return FacilityResponse(
            id=new_facility.id,
            name=new_facility.name,
            owner_id=new_facility.owner_id,
            sport_type=new_facility.sport_type,
            court_layout=new_facility.court_layout,
            description=new_facility.description,
            price_per_hour=new_facility.price_per_hour,
            cover_image=new_facility.cover_image,
            location=new_facility.location,
            rating=new_facility.rating,
            reviews_count=new_facility.reviews_count,
            amenities=new_facility.amenities or [],
            opening_hours=new_facility.opening_hours,
            is_active=new_facility.is_active,
            images=images_paths,
            created_at=new_facility.created_at,
            updated_at=new_facility.updated_at,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo sân: {str(e)}")
    
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
    if facility.owner_id != current_user.id and current_user.role != "admin":
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

# Xóa sân
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
    if facility.owner_id != current_user.id and current_user.role != "admin":
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

# Cập nhật trạng thái sân
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
    if facility.owner_id != current_user.id and current_user.role != "admin":
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
@router.get("/detail/{facility_id}")
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
        "cover_image": facility.cover_image,
        "location": facility.location,
        "rating": facility.rating,
        "reviews_count": facility.reviews_count,
        "amenities": facility.amenities,
        "opening_hours": facility.opening_hours,
        "is_active": facility.is_active,
        "created_at": facility.created_at,
        "updated_at": facility.updated_at,
        "owner_id": facility.owner_id,
        "images": facility.images
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