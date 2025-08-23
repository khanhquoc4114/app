from uuid import uuid4
from fastapi import FastAPI, Depends, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db, engine
from models import *
from schemas import *
from typing import List
from auth import *
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from routes import facilities, notifications, auth, booking, me
from auth import get_current_user_id, get_admin_user, get_current_user

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sports Facility Auth API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Register routers
app.include_router(facilities.router)
app.include_router(notifications.router)
app.include_router(auth.router) 
app.include_router(booking.router)
app.include_router(me.router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# JWT config
SECRET_KEY = "my-secret-key-123"
ALGORITHM = "HS256"

@app.get("/")
def root():
    return {"message": "Auth API đang chạy"}
 
@app.get("/api/users/all", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.post("/request-host-upgrade")
async def request_host_upgrade(
    # full_name: str = Form(...),
    # phone: str = Form(...),
    cccd_front: list[UploadFile] = Form(...),
    cccd_back: list[UploadFile] = Form(...),
    business_license: list[UploadFile] = Form(...),
    facility_images: list[UploadFile] = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Kiểm tra nếu user đã có request pending
    existing = db.query(UserUpgradeRequest).filter_by(user_id=current_user.id, status='pending').first()
    if existing:
        raise HTTPException(status_code=400, detail="Bạn đã gửi yêu cầu trước đó")

    # Lưu file và lấy đường dẫn
    cccd_front_path = [await save_file(file) for file in cccd_front]
    cccd_back_path = [await save_file(file) for file in cccd_back]
    business_license_path = [await save_file(file) for file in business_license]
    facility_images_path = [await save_file(file) for file in facility_images]

    upgrade_request = UserUpgradeRequest(
        user_id=current_user.id,
        status='pending',
        cccd_front=cccd_front_path[0],
        cccd_back=cccd_back_path[0],
        business_license=business_license_path[0],
        facility_images=facility_images_path
    )
    db.add(upgrade_request)
    db.commit()
    db.refresh(upgrade_request)

    return {"detail": "Yêu cầu nâng cấp đã gửi thành công"}

UPLOAD_DIR = "uploads"

# Tạo folder nếu chưa tồn tại
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_file(file: UploadFile) -> str:
    """
    Lưu file upload vào server và trả về đường dẫn
    """
    # Tạo tên file unique để tránh trùng
    ext = os.path.splitext(file.filename)[1]  # lấy phần đuôi file
    unique_filename = f"{uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Lưu file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return file_path

@app.get("/admin/upgrade-requests")
def list_upgrade_requests(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    requests = db.query(UserUpgradeRequest).filter_by(status='pending').all()
    return requests

@app.post("/admin/upgrade-requests/{request_id}/approve")
def approve_upgrade_request(request_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    req = db.query(UserUpgradeRequest).get(request_id)
    if not req or req.status != 'pending':
        raise HTTPException(status_code=404, detail="Request không tồn tại hoặc đã xử lý")

    # Update user role
    user = db.query(User).get(req.user_id)
    user.role = 'host'
    req.status = 'approved'
    db.commit()

    return {"detail": "Đã phê duyệt"}

@app.post("/admin/upgrade-requests/{request_id}/reject")
def reject_upgrade_request(request_id: int, reason: str = Form(...), db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    req = db.query(UserUpgradeRequest).get(request_id)
    if not req or req.status != 'pending':
        raise HTTPException(status_code=404, detail="Request không tồn tại hoặc đã xử lý")

    req.status = 'rejected'
    req.rejection_reason = reason
    db.commit()

    return {"detail": "Đã từ chối"}
