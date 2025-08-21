from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # user, admin, host
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    total_bookings = Column(Integer, default=0)   # tổng số lần booking
    total_spent = Column(Integer, default=0)
    phone = Column(String, nullable=True)   
    address = Column(String, nullable=True)
    avatar = Column(String, nullable=True)  # link ảnh
    favorite_sport = Column(String, nullable=True)
    member_level = Column(String, default="Bronze")
    
    # Relationships
    bookings = relationship("Booking", back_populates="user")
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # id user chủ sân
    sport_type = Column(String, nullable=False)  # badminton, football, tennis, etc.
    description = Column(Text)
    price_per_hour = Column(Float, nullable=False)
    image_url = Column(String)
    location = Column(String)                     # thêm địa chỉ
    rating = Column(Float, default=0.0)           # điểm trung bình
    reviews_count = Column(Integer, default=0)    # số review
    amenities = Column(ARRAY(String))             # mảng tiện ích (Postgres hỗ trợ ARRAY)
    opening_hours = Column(String)                # giờ mở cửa dạng text
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    bookings = relationship("Booking", back_populates="facility")
    owner = relationship("User", foreign_keys=[owner_user_id])

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)
    booking_date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, cancelled, completed
    payment_status = Column(String, default="unpaid")  # unpaid, paid, refunded
    payment_method = Column(String)  # momo, cash, etc.
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    facility = relationship("Facility", back_populates="bookings")
    
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # Liên kết với user (ai là người nhận notification này)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    type = Column(String, nullable=False) # loại notification (booking, payment, system, etc.)

    # Nội dung
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    # Metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=False)
    priority = Column(String, default="medium")   # low, medium, high

    # Dữ liệu bổ sung (vd: booking_id, payment_id)
    data = Column(JSON)

    user = relationship("User", back_populates="notifications")