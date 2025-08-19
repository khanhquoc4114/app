from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
import bcrypt
from sqlalchemy import func
from database import get_db, engine
from models import *
from schemas import *
from pydantic import BaseModel

# Create tables

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sports Facility Auth API")

# CORS cho React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

def create_access_token(username: str, role: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"sub": username, "role": role, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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

@app.post("/api/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Tìm user
    db_user = db.query(User).filter(User.username == user.username).first()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Username không tồn tại")
    
    # Kiểm tra password
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Mật khẩu không đúng")
    
    # Tạo token
    access_token = create_access_token(db_user.username, db_user.role)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role
        }
    }

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

    token = f"fake-jwt-for-{user.username}"

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }