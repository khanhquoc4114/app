from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Table, Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from fastapi import Request 

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    provider = Column(String, nullable=True)         # "google", "github", ...
    provider_id = Column(String, nullable=True)      # id từ Google
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
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    staff_members = relationship("Staff", back_populates="host", foreign_keys="Staff.host_id")  # chỉ host mới có
    staff_of = relationship("Staff", back_populates="user", foreign_keys="Staff.user_id")  # chỉ staff mới có
    upgrade_requests = relationship(
        "UserUpgradeRequest",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
class UserUpgradeRequest(Base):
    __tablename__ = "user_upgrade_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    status = Column(String, default="pending")  # pending / approved / rejected
    reason = Column(String, nullable=True)
    experience = Column(Text, nullable=True)
    rejection_reason = Column(String, nullable=True)

    cccd_front_image = Column(String, nullable=False)
    cccd_back_image = Column(String, nullable=False)
    business_license_image = Column(String, nullable=False)
    facility_images = Column(Text, nullable=False)
    
    business_name = Column(String, nullable=True)
    business_address = Column(String, nullable=True)
    business_license = Column(String, nullable=False)
    
    bank_id = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship với user
    user = relationship("User", back_populates="upgrade_requests")

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # id user chủ sân
    sport_type = Column(ARRAY(String), nullable=False)  # badminton, football, tennis, etc.
    court_layout = Column(JSON, nullable=True)   # lưu layout sân dưới dạng JSON {sport_type, court_counts} cho từng môn thể thao
    description = Column(Text)
    price_per_hour = Column(Float, nullable=False)
    cover_image = Column(Text, nullable=True)     # ảnh đại diện
    status = Column(String, default="active")     # active, inactive, maintenance
    location = Column(String)                     # thêm địa chỉ
    rating = Column(Float, default=0.0)           # điểm trung bình
    reviews_count = Column(Integer, default=0)    # số review
    amenities = Column(ARRAY(String))             # mảng tiện ích (Postgres hỗ trợ ARRAY)
    opening_hours = Column(String)                # giờ mở cửa dạng text
    images = Column(Text, nullable=True)          # ảnh của sân
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    bookings = relationship("Booking", back_populates="facility")
    owner = relationship("User", foreign_keys=[owner_id])
    liked_by = relationship("UserFavorite", back_populates="facility", cascade="all, delete-orphan")

class UserFavorite(Base):
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    facility = relationship("Facility", back_populates="liked_by")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)
    sport_type = Column(String, nullable=True)  
    court_id = Column(Integer, nullable=True)  
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
    title = Column(String, nullable=False) # Tiêu đề
    message = Column(Text, nullable=False) # Nội dung 

    # Metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=False)
    priority = Column(String, default="medium")   # low, medium, high

    # Dữ liệu bổ sung (vd: booking_id, payment_id)
    data = Column(JSON)

    user = relationship("User", back_populates="notifications")
      
class Staff(Base):
    __tablename__ = "staffs"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    host = relationship("User", foreign_keys=[host_id], back_populates="staff_members")
    user = relationship("User", foreign_keys=[user_id], back_populates="staff_of")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    is_read = Column(Boolean, default=False)
    
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
