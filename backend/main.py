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
from routes import facilities, notifications, auth, booking, me, admin, messages
from auth import get_current_user
import json
from starlette.middleware.sessions import SessionMiddleware
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict


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
app.include_router(messages.router)

# Import and register payment router
from routes import payment
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])

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
 
@app.get("/api/users/all-chatted", response_model=List[UserOut])
def get_users_talked_to(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Lấy tất cả message liên quan đến current_user
    messages = db.query(Message).filter(
        (Message.sender_id == current_user.id) | 
        (Message.receiver_id == current_user.id)
    ).all()

    # Tạo set chứa ID người dùng đã trò chuyện với current_user
    user_ids = set()
    for msg in messages:
        if msg.sender_id != current_user.id:
            user_ids.add(msg.sender_id)
        if msg.receiver_id != current_user.id:
            user_ids.add(msg.receiver_id)

    # Truy vấn lại user từ các ID đã thu thập
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    return users

@app.get("/api/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

# 2. Lấy user cụ thể theo id
@app.get("/api/users/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")
    return user

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

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

# ws://localhost:8000/chat?token=<token>
active_connections: dict[int, WebSocket] = {}

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    try:
        user = decode_token(token)
        user_id = user["id"]
        await websocket.accept()
        active_connections[user_id] = websocket
    except Exception as e:
        await websocket.close(code=1008)
        return

    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle ping/pong
            if data.get("type") == "ping":
                continue
            
            # Validate data
            if "receiver_id" not in data or "content" not in data:
                continue
                
            receiver_id = data["receiver_id"]
            content = data["content"].strip()
            
            if not content:
                continue
            
            # Kiểm tra receiver tồn tại
            receiver = db.query(User).filter(User.id == receiver_id).first()
            if not receiver:
                await websocket.send_json({"error": "Receiver not found"})
                continue

            # Lưu vào DB
            msg = Message(sender_id=user_id, receiver_id=receiver_id, content=content)
            db.add(msg)
            db.commit()
            db.refresh(msg)

            # Gửi cho cả sender và receiver
            message_data = {
                "id": msg.id,
                "from": user_id,
                "message": content,
                "created_at": msg.created_at.isoformat()
            }

            # 1. Gửi cho người nhận
            if receiver_id in active_connections:
                try:
                    await active_connections[receiver_id].send_json(message_data)
                except:
                    active_connections.pop(receiver_id, None)
            
            # 2. Gửi confirmation lại cho người gửi
            try:
                await websocket.send_json({
                    "id": msg.id,
                    "from": user_id,
                    "to": receiver_id,
                    "message": content,
                    "created_at": msg.created_at.isoformat()
                })
            except:
                pass
                    
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)
    except Exception as e:
        print(f"WebSocket error: {e}")
        active_connections.pop(user_id, None)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        if user_id is None:
            raise ValueError("Invalid token: no user id")
        return {"id": user_id, "role": role}
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")

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