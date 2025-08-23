from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
import os
import smtplib
from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from passlib.context import CryptContext
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY = "my-secret-key-123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT functions (từ code của bạn)
def create_reset_token(data: dict, expires_minutes: int = 15):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def send_reset_password_email(email: str, reset_token: str, user_name: str = None):
    """Gửi email reset password"""
    try:
        reset_url = f"{FRONTEND_URL}/reset-password/{reset_token}"
        
        # Tạo nội dung email HTML
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Đặt lại mật khẩu</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Đặt lại mật khẩu</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Xin chào{' ' + user_name if user_name else ''}!</h2>
                
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
                
                <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 8px; 
                              display: inline-block; 
                              font-weight: bold;
                              font-size: 16px;">
                        Đặt lại mật khẩu
                    </a>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Lưu ý quan trọng:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #856404;">
                        <li>Liên kết này có hiệu lực trong <strong>15 phút</strong></li>
                        <li>Chỉ sử dụng được <strong>một lần</strong></li>
                        <li>Không chia sẻ liên kết này với bất kỳ ai</li>
                        <li>Nếu bạn không yêu cầu, vui lòng bỏ qua email này</li>
                    </ul>
                </div>
                
                <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">🛡️ Bảo mật tài khoản:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #0c5460; font-size: 14px;">
                        <li>Sử dụng mật khẩu mạnh (ít nhất 8 ký tự)</li>
                        <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                        <li>Không sử dụng mật khẩu này cho tài khoản khác</li>
                        <li>Đăng xuất khi sử dụng máy tính chung</li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Nếu nút không hoạt động, bạn có thể copy và paste liên kết sau vào trình duyệt:
                    <br>
                    <a href="{reset_url}" style="color: #667eea; word-break: break-all;">{reset_url}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                    © 2025 Hệ thống của bạn. Tất cả quyền được bảo lưu.
                    <br>
                    Email này được gửi tự động, vui lòng không trả lời.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Tạo email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "🔐 Đặt lại mật khẩu - Hệ thống của bạn"
        msg['From'] = FROM_EMAIL
        msg['To'] = email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Gửi email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
            
        print(f"Reset password email sent to: {email}")
        return True
        
    except Exception as e:
        print(f"Error sending email to {email}: {str(e)}")
        return False
    
def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    return payload["id"]



def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user_id = payload["id"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập")
    return current_user