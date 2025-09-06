from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Booking, Facility
from schemas import BookingCreate
from auth import oauth2_scheme, verify_token

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)

@router.get("/")
def get_bookings(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user_id = payload["id"]
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    return [
        {
            "id": b.id,
            "facility_id": b.facility_id,
            "sport_type": b.sport_type,
            "facility": b.facility.name if b.facility else None,
            "court_id": b.court_id,
            "location": b.facility.location if b.facility else None,
            "user_id": b.user_id,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "total_price": b.total_price,
            "created_at": b.created_at,
            "payment_status": b.payment_status,
            "payment_method": b.payment_method,
            "notes": b.notes
        }
        for b in bookings
    ]

@router.post("/")
def create_booking(
    booking_data: BookingCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    
    user_id = payload["id"]

    # Kiểm tra facility có tồn tại không
    facility = db.query(Facility).filter(Facility.id == booking_data.facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Không tìm thấy sân")

    # Tạo booking mới
    new_booking = Booking(
        user_id=user_id,
        facility_id=booking_data.facility_id,
        sport_type=booking_data.sport_type,
        court_id=booking_data.court_id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        total_price=booking_data.total_price,
        status="pending",
        payment_status="unpaid",
        payment_method="pending",
        notes=booking_data.notes or f"Đặt sân {', '.join(booking_data.time_slots)}"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "message": "Đặt sân thành công!",
        "booking_id": new_booking.id,
        "facility_name": facility.name,
        "total_price": new_booking.total_price,
        "booking_date": new_booking.booking_date.isoformat(),
        "time_slots": booking_data.time_slots
    }
from fastapi import Query

@router.get("/search")
def search_bookings(
    facility_id: int = Query(..., description="ID sân"),
    date: str = Query(..., description="Ngày đặt (YYYY-MM-DD)"),
    sport_type: str = Query(None, description="Loại môn thể thao"),
    db: Session = Depends(get_db)
):
    query = db.query(Booking).filter(
        Booking.facility_id == facility_id,
        Booking.booking_date == date
    )
    if sport_type:
        query = query.filter(Booking.sport_type == sport_type)
    bookings = query.all()
    return [
        {
            "id": b.id,
            "facility_id": b.facility_id,
            "sport_type": b.sport_type,
            "court_id": b.court_id,
            "user_id": b.user_id,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "total_price": b.total_price,
            "created_at": b.created_at,
            "payment_status": b.payment_status,
            "payment_method": b.payment_method,
            "notes": b.notes
        }
        for b in bookings
    ]
    
@router.get("/owner")
def get_bookings_for_host(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # Xác minh token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    owner_id = payload["id"]  # host id

    # Join Booking với Facility để lọc theo owner_id
    bookings = (
        db.query(Booking)
        .join(Facility, Booking.facility_id == Facility.id)
        .filter(Facility.owner_id == owner_id)
        .all()
    )

    return [
        {
            "id": b.id,
            "customer": b.user.full_name if b.user else None,
            "phone": b.user.phone if b.user else None,
            "facility": b.facility.name if b.facility else None,
            "time": f"{b.start_time.strftime('%H:%M')} - {b.end_time.strftime('%H:%M')}",
            "amount": b.total_price,
            "status": b.status,
            "checkedIn": b.status == "completed"
        }
        for b in bookings
    ]