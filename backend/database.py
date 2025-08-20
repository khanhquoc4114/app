
# Import các thư viện cần thiết từ SQLAlchemy và các module khác
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load biến môi trường từ file .env (nếu có)
load_dotenv()

# Lấy thông tin cấu hình database từ biến môi trường hoặc dùng giá trị mặc định
DB_USER = os.getenv("DB_USER", "sports_user")  # Tên user của database
DB_PASSWORD = os.getenv("DB_PASSWORD", "sports_password")  # Mật khẩu database
DB_HOST = os.getenv("DB_HOST", "postgres")  # Địa chỉ host của database
DB_NAME = os.getenv("DB_NAME", "sports_facility_db")  # Tên database

# Tạo chuỗi kết nối tới PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Tạo engine để kết nối tới database
engine = create_engine(DATABASE_URL)
# Tạo session factory để làm việc với database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base dùng để khai báo các model ORM
Base = declarative_base()

# Hàm tiện ích để lấy session, dùng cho dependency injection trong FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()