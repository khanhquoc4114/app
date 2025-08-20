from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
import bcrypt
from sqlalchemy import func
from database import get_db, engine
from models import *
from schemas import *
from typing import List
from auth import *
from fastapi import Request

# Create tables

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sports Facility Auth API")

# CORS cho React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# JWT config
SECRET_KEY = "my-secret-key-123"
ALGORITHM = "HS256"

@app.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra username đã tồn tại chưa
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")
    
    # Kiểm tra email đã tồn tại chưa
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    
    # Mã hóa password
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    # Tạo user mới
    new_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password.decode('utf-8'),
        role="user"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Đăng ký thành công", "username": new_user.username}

# Endpoint mới để lấy danh sách cơ sở thể thao
@app.get("/api/facilities")
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

@app.get("/api/facilities/count")
def count_active_facilities(db: Session = Depends(get_db)):
    count = db.query(Facility).filter(Facility.is_active == True).count()
    return {"count": count}

@app.get("/api/facilities/popular-sports")
def get_popular_sports(db: Session = Depends(get_db)):
    results = (
        db.query(Facility.sport_type, func.count(Facility.id).label("courts"))
        .filter(Facility.is_active == True)
        .group_by(Facility.sport_type)
        .all()
    )
    return [
        {"sportType": r.sport_type, "courts": r.courts}
        for r in results
    ]

@app.get("/")
def root():
    return {"message": "Auth API đang chạy"}

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Facility.is_active == True).all()
    return notifications

@app.patch("/api/notifications/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification

@app.patch("/api/notifications/mark-all-read")
def mark_all_as_read(db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.read == False).all()

    for n in notifications:
        n.read = True

    db.commit()
    return {"message": f"{len(notifications)} notifications marked as read"}
    
@app.post("/api/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:# or not check_password_hash(user.hashed_password, request.password):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    access_token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }
    
@app.get("/api/users/all", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

@app.get("/api/auth/me")
def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user = db.query(User).filter(User.id == payload["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "address": user.address,
        "avatar": user.avatar,
        "role": user.role,
        "created_at": user.created_at,
        "total_bookings": user.total_bookings,
        "total_spent": user.total_spent,
        "favorite_sport": user.favorite_sport,
        "member_level": user.member_level
    }
    
@app.post("/api/auth/change-password")
def change_password(
    data: ChangePasswordRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user = db.query(User).filter(User.id == payload["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    # if not verify_password(data.old_password, user.hashed_password):
    #     raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")
    if data.old_password != user.hashed_password:
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")

    user.hashed_password = data.new_password # cần hash mật khẩu, để sau 
    db.commit()
    return {"message": "Đổi mật khẩu thành công!"}


@app.post("/api/auth/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra user đã tồn tại chưa
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username hoặc Email đã tồn tại")

    # Tạo user mới
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=user_data.password, # Thêm hashing sau
        role="user",  # mặc định
        is_active=True,
        total_bookings=0,
        total_spent=0,
        member_level="Bronze"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Đăng ký thành công!", "user_id": new_user.id}

@app.get("/api/bookings")
def get_bookings(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user_id = payload["id"]
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    return [
        {
            "id": b.id,
            "facility_id": b.facility_id,
            "facility": b.facility.name if b.facility else None,
            "sport": b.facility.sport_type if b.facility else None,
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

@app.post("/api/bookings")
def create_booking(booking_data: BookingCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
