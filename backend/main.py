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
from routes import facilities, notifications, auth, booking, me, admin
from auth import get_current_user
import json
from starlette.middleware.sessions import SessionMiddleware

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

app.add_middleware(SessionMiddleware, secret_key="my-secret-key-123")

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
app.include_router(admin.router)

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
    business_name: str = Form(...),
    business_address: str = Form(...),
    business_license_number: str = Form(...),  # đổi tên để tránh conflict
    experience: str = Form(...),
    reason: str = Form(...),
    bank_name: str = Form(None),
    bank_id: str = Form(None),
    cccd_front: list[UploadFile] = Form(...),
    cccd_back: list[UploadFile] = Form(...),
    business_license: list[UploadFile] = Form(...),  # file field
    facility_images: list[UploadFile] = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Received form data:")
        print(f"- business_name: {business_name}")
        print(f"- business_address: {business_address}")
        print(f"- business_license_number: {business_license_number}")
        print(f"- experience: {experience}")
        print(f"- reason: {reason}")
        print(f"- bank_name: {bank_name}")
        print(f"- bank_id: {bank_id}")
        print(f"- Files received: cccd_front={len(cccd_front)}, cccd_back={len(cccd_back)}, business_license={len(business_license)}, facility_images={len(facility_images)}")
        
        # Kiểm tra nếu user đã có request pending
        existing = db.query(UserUpgradeRequest).filter_by(
            user_id=current_user.id, status="pending"
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bạn đã gửi yêu cầu trước đó")

        # Lưu file và lấy đường dẫn
        cccd_front_path = [await save_file(file) for file in cccd_front]
        cccd_back_path = [await save_file(file) for file in cccd_back]
        business_license_file_path = [await save_file(file) for file in business_license]
        facility_images_path = [await save_file(file) for file in facility_images]

        # Tạo bản ghi mới
        upgrade_request = UserUpgradeRequest(
            user_id=current_user.id,
            status="pending",
            reason=reason,  # lý do muốn làm host
            experience=experience,
            cccd_front_image=cccd_front_path[0],
            cccd_back_image=cccd_back_path[0],
            business_license_image=business_license_file_path[0],  # file giấy phép
            facility_images=json.dumps(facility_images_path),
            business_name=business_name,
            business_address=business_address,
            business_license=business_license_number,  # lưu số đăng ký kinh doanh
            bank_name=bank_name,
            bank_id=bank_id,
        )

        db.add(upgrade_request)
        db.commit()
        db.refresh(upgrade_request)

        return {"detail": "Yêu cầu nâng cấp đã gửi thành công", "request_id": upgrade_request.id}
        
    except Exception as e:
        print(f"Error in request_host_upgrade: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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