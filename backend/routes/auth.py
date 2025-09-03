import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import (
    LoginRequest, UserCreate, ChangePasswordRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)

from auth import (
    verify_password, hash_password,
    create_access_token, verify_token,
    oauth2_scheme, create_reset_token, verify_reset_token, get_current_user_id
)

from auth import send_reset_password_email
from datetime import datetime, timedelta
from services.notification import create_notification
from fastapi import Request
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "id": user.id}
    )
    
    create_notification(
        db=db,
        user_id=user.id,
        type="system",
        title="Đăng nhập thành công",
        message=f"Tài khoản {user.username} vừa đăng nhập vào hệ thống",
        priority="low",
        data={}
    )
    
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

@router.get("/me")
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

@router.post("/change-password")
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

    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")

    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công!"}

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username hoặc Email đã tồn tại")

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        role="user",
        is_active=True,
        total_bookings=0,
        total_spent=0,
        member_level="Bronze"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Đăng ký thành công!", "user_id": new_user.id}

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email reset."}

    reset_token = create_reset_token(
        data={"id": user.id, "email": user.email, "purpose": "password_reset"},
        expires_minutes=15
    )

    background_tasks.add_task(
        send_reset_password_email,
        request.email,
        reset_token,
        getattr(user, 'name', None)
    )
    return {"message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email reset."}

@router.get("/verify-reset-token/{token}")
async def verify_reset_token_endpoint(token: str, db: Session = Depends(get_db)):
    payload = verify_reset_token(token)
    if not payload or payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Token không hợp lệ hoặc đã hết hạn")

    user = db.query(User).filter(User.id == payload["id"]).first()
    if not user:
        raise HTTPException(status_code=400, detail="User không tồn tại")

    return {"valid": True, "message": "Token hợp lệ", "user_id": payload["id"]}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = verify_reset_token(request.token)
    if not payload or payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Token không hợp lệ hoặc đã hết hạn")

    user = db.query(User).filter(User.id == payload["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    user.hashed_password = hash_password(request.new_password)
    db.commit()
    return {"message": "Đặt lại mật khẩu thành công!"}

# login with google
oauth = OAuth()

google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://oauth2.googleapis.com/token',
    userinfo_url='https://www.googleapis.com/oauth2/v2/userinfo',
    client_kwargs={
        'scope': 'openid email profile'
    },
    redirect_uri='http://localhost:5000/auth/google/callback',
    jwks_uri = "https://www.googleapis.com/oauth2/v3/certs"
)

@router.get("/google")
async def google_auth(request: Request):
    redirect_uri = str(request.url_for("google_callback"))
    return await oauth.google.authorize_redirect(request, redirect_uri)

ACCESS_TOKEN_EXPIRE_MINUTES = 60
FRONTEND_URL = "http://localhost:3000"

@router.get("/google/callback", name="google_callback")
async def google_callback(
    request: Request, 
    db: Session = Depends(get_db)
):
    token = await oauth.google.authorize_access_token(request)
    user_data = token.get("userinfo")

    if not user_data:
        raise HTTPException(status_code=400, detail="Google login failed")

    # Tìm user trong DB
    db_user = db.query(User).filter(User.email == user_data["email"]).first()

    # Nếu chưa có thì tạo mới
    if not db_user:
        db_user = User(
            username=user_data["email"].split("@")[0],
            email=user_data["email"],
            full_name=user_data.get("name", ""),
            provider="google",
            provider_id=user_data["sub"],   # id duy nhất của Google user
            hashed_password=None,           # login social => không cần password
            avatar=user_data.get("picture")
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Tạo JWT access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "id": db_user.id},
        expires_delta=access_token_expires
    )
    
    redirect_url = (
        f"{FRONTEND_URL}/auth/callback/google"
        f"?token={access_token}"
        f"&role={getattr(db_user, 'role', 'user')}"
    )

    return RedirectResponse(url=redirect_url, status_code=302)
    