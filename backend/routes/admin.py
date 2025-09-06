from pydantic import BaseModel
from auth import get_admin_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import *
from datetime import datetime, date
from services.notification import create_notification

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/upgrade-requests")
def list_upgrade_requests(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    requests = (
        db.query(UserUpgradeRequest, User)
        .join(User, User.id == UserUpgradeRequest.user_id)
        .all()
    )

    result = []
    for req, user in requests:
        result.append({
            "id": req.id,
            "user_id": req.user_id,
            "status": req.status,
            "reason": req.reason,
            "experience": req.experience,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "cccd_front_image": req.cccd_front_image,
            "cccd_back_image": req.cccd_back_image,
            "business_license_image": req.business_license_image,
            "facility_images": req.facility_images,
            "business_name": req.business_name,
            "business_address": req.business_address,
            "business_license": req.business_license,
            "bank_id": req.bank_id,
            "bank_name": req.bank_name,

            # Thông tin user
            "user": {
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
            }
        })
    return result

@router.post("/upgrade-requests/{request_id}/approve")
def approve_upgrade_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    req = db.get(UserUpgradeRequest, request_id)
    if not req or req.status != "pending":
        raise HTTPException(status_code=404, detail="Request không tồn tại hoặc đã xử lý")

    user = db.get(User, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    try:
        user.role = "host"
        req.status = "approved"
        
        create_notification(
            db=db,
            user_id=user.id,
            type="system",
            title="Kết quả đơn nâng cấp role",
            message=f"Tài khoản {user.username} được duyệt thành chủ sân",
            priority="high",
            data={}
        )

        db.commit()
        db.refresh(user)
        db.refresh(req)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi approve: {str(e)}")

    return {
        "detail": "Đã phê duyệt",
        "user": {"id": user.id, "username": user.username, "role": user.role},
        "request": {"id": req.id, "status": req.status}
    }

class RejectRequestBody(BaseModel):
    reason: str

@router.post("/upgrade-requests/{request_id}/reject")
def reject_upgrade_request(
    request_id: int,
    body: RejectRequestBody,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    req = db.get(UserUpgradeRequest, request_id)
    if not req or req.status != "pending":
        raise HTTPException(status_code=404, detail="Request không tồn tại hoặc đã xử lý")

    req.status = "rejected"
    req.rejection_reason = body.reason
    req.updated_at = datetime.utcnow()

    user = db.get(User, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    create_notification(
        db=db,
        user_id=user.id,
        type="system",
        title="Kết quả đơn nâng cấp role",
        message=f"Yêu cầu nâng cấp tài khoản {user.username} bị từ chối. Lý do: {body.reason}",
        priority="high",
        data={}
    )

    db.commit()
    db.refresh(req)

    return {"detail": "Đã từ chối", "request": {"id": req.id, "status": req.status, "reason": req.rejection_reason}}

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_revenue = 0
    total_users = db.query(func.count(User.id)).scalar()
    total_facilities = db.query(func.count(Facility.id)).scalar()
    today_bookings = db.query(func.count(Booking.id)).filter(
        func.date(Booking.created_at) == date.today()
    ).scalar()

    return {
        "totalRevenue": total_revenue,
        "totalUsers": total_users,
        "totalFacilities": total_facilities,
        "todayBookings": today_bookings
    }
