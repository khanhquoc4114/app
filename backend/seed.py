from sqlalchemy.orm import Session
from models import *
from database import engine, SessionLocal
from datetime import datetime, timedelta
from auth import hash_password

def seed_facilities(db: Session):
    if db.query(Facility).count() == 0:
        # Lấy id user theo username
        user_map = {u.username: u.id for u in db.query(User).all()}
        facilities = [
            Facility(
                name="Sân cầu lông 54",
                owner_id=4,
                sport_type= ["badminton", "football"],  # vẫn giữ để tương thích cũ
                court_layout=[
                    {"sport_type": "badminton", "count": 6},
                    {"sport_type": "football", "count": 4}
                ],                
                description="Sân cầu lông chất lượng cao với sàn gỗ chuyên nghiệp, hệ thống chiếu sáng LED hiện đại",
                price_per_hour=80000,
                image_url="/images/badminton-1.jpg",
                location="Quận 1, TP.HCM",
                rating=4.8,
                reviews_count=124,
                amenities=["Điều hòa", "Wifi", "Bãi đỗ xe", "Phòng thay đồ"],
                opening_hours="06:00 - 22:00"
            ),
            Facility(
                name="Sân bóng đá 2",
                owner_id=4,
                sport_type=["football"],
                court_layout=[
                    {"sport_type": "football", "count": 2}
                ],              
                description="Sân bóng đá mini 5v5 với cỏ nhân tạo cao cấp, hệ thống tưới nước tự động",
                price_per_hour=200000,
                image_url="/images/football-1.jpg",
                location="Quận 7, TP.HCM",
                rating=4.6,
                reviews_count=89,
                amenities=["Điều hòa phòng chờ", "Bãi đỗ xe", "Phòng thay đồ", "Căng tin"],
                opening_hours="05:00 - 23:00"
            ),
            Facility(
                name="Sân tennis 1",
                owner_id=4,
                sport_type=["tennis"],
                court_layout=[
                    {"sport_type": "tennis", "count": 1}
                ],
                description="Sân tennis tiêu chuẩn quốc tế với mặt sân hard court, lưới chuyên nghiệp",
                price_per_hour=150000,
                image_url="/images/tennis-1.jpg",
                location="Quận 3, TP.HCM",
                rating=4.9,
                reviews_count=156,
                amenities=["Điều hòa", "Wifi", "Bãi đỗ xe", "Phòng thay đồ", "Thuê vợt"],
                opening_hours="06:00 - 21:00"
            ),
            Facility(
                name="Sân bóng rổ",
                owner_id=4,
                sport_type=["basketball"],
                court_layout=[
                    {"sport_type": "basketball", "count": 1}
                ],
                description="Sân bóng rổ trong nhà với sàn gỗ chuyên nghiệp, rổ chuẩn NBA",
                price_per_hour=120000,
                image_url="/images/basketball-1.jpg",
                location="Quận 10, TP.HCM",
                rating=4.7,
                reviews_count=78,
                amenities=["Điều hòa", "Âm thanh", "Bãi đỗ xe", "Phòng thay đồ"],
                opening_hours="06:00 - 22:00"
            )
        ]
        db.add_all(facilities)
        db.commit()
        print("✅ Seeded initial facilities data")
    else:
        print("ℹ️ Facilities already exist")

def seed_notifications(db: Session):
    if db.query(Notification).count() == 0:
        sample_notifications = [
            Notification(
                user_id=1,
                type="booking_confirmed",
                title="Đặt sân thành công",
                message="Bạn đã đặt thành công sân cầu lông VIP 1 vào ngày 20/01/2024 lúc 08:00-10:00.",
                timestamp=datetime.utcnow() - timedelta(minutes=5),
                read=False,
                priority="high",
                data={"bookingId": "BK001", "facilityName": "Sân cầu lông VIP 1"}
            ),
            Notification(
                user_id=1,
                type="payment_success",
                title="Thanh toán thành công",
                message="Thanh toán 160,000 VNĐ cho đặt sân BK001 đã được xử lý thành công.",
                timestamp=datetime.utcnow() - timedelta(minutes=15),
                read=False,
                priority="medium",
                data={"amount": 160000, "bookingId": "BK001"}
            ),
            Notification(
                user_id=1,
                type="booking_reminder",
                title="Nhắc nhở lịch đặt sân",
                message="Bạn có lịch đặt sân tennis lúc 14:00 hôm nay. Vui lòng đến đúng giờ.",
                timestamp=datetime.utcnow() - timedelta(hours=2),
                read=True,
                priority="medium",
                data={"facilityName": "Sân tennis cao cấp", "time": "14:00"}
            ),
            Notification(
                user_id=2,
                type="promotion",
                title="Ưu đãi cuối tuần",
                message="Giảm 20% cho tất cả sân cầu lông vào cuối tuần này (22-23/01/2024).",
                timestamp=datetime.utcnow() - timedelta(hours=4),
                read=False,
                priority="low",
                data={"discount": 20, "validUntil": "23/01/2024"}
            ),
            Notification(
                user_id=2,
                type="system",
                title="Bảo trì hệ thống",
                message="Hệ thống sẽ bảo trì từ 02:00-04:00 ngày 21/01/2024. Vui lòng hoàn tất giao dịch trước thời gian này.",
                timestamp=datetime.utcnow() - timedelta(days=1),
                read=False,
                priority="high",
                data={"maintenanceTime": "02:00-04:00", "date": "21/01/2024"}
            ),
            Notification(
                user_id=2,
                type="booking_cancelled",
                title="Hủy đặt sân",
                message="Đặt sân BK002 đã bị hủy theo yêu cầu của bạn.",
                timestamp=datetime.utcnow() - timedelta(days=2),
                read=True,
                priority="medium",
                data={"bookingId": "BK002", "reason": "Người dùng hủy"}
            ),
            Notification(
                user_id=1,
                type="friend_invite",
                title="Lời mời tham gia trận đấu",
                message="Người dùng Nam Trần mời bạn tham gia trận cầu lông vào 18:00 ngày 22/01/2024.",
                timestamp=datetime.utcnow() - timedelta(minutes=30),
                read=False,
                priority="low",
                data={"inviter": "Nam Trần", "time": "18:00", "date": "22/01/2024"}
            )
        ]

        db.add_all(sample_notifications)
        db.commit()
        print("✅ Seeded 7 notifications")
    else:
        print("ℹ️ Notifications already exist")
        
def seed_users(db: Session):
    if db.query(User).count() == 0:
        sample_users = [
            User(
                username="staff",
                email="nguyenvana@example.com",
                full_name="Nguyễn Văn A",
                hashed_password=hash_password("staff123"),
                role="staff",
                total_bookings=5,
                total_spent=800000
            ),
            User(
                username="user",
                email="tranthib@example.com",
                full_name="Trần Thị B",
                hashed_password=hash_password("user123"),
                role="user",
                total_bookings=3,
                total_spent=450000
            ),
            User(
                username="admin",
                email="admin@example.com",
                full_name="Admin User",
                hashed_password=hash_password("admin123"),
                role="admin",
                total_bookings=10,
                total_spent=2000000
            ),
            User(
                username="host",
                email="leminhc@example.com",
                full_name="Lê Minh C",
                hashed_password=hash_password("host123"),
                role="host",
                total_bookings=0,
                total_spent=0
            )
        ]
        db.add_all(sample_users)
        db.commit()
        print("✅ Seeded user data")
    else:
        print("ℹ️ User already exist")

def seed_bookings(db: Session):
    if db.query(Booking).count() == 0:
        user_map = {u.username: u.id for u in db.query(User).all()}
        facility_map = {f.name: f.id for f in db.query(Facility).all()}
        bookings = [
            Booking(
                user_id=1,
                facility_id=3,
                court_id=2,
                booking_date=datetime(2025, 8, 21, 8, 0, 0),
                start_time=datetime(2025, 8, 21, 8, 0, 0),
                end_time=datetime(2025, 8, 21, 10, 0, 0),
                total_price=160000,
                status="confirmed",
                payment_status="paid",
                payment_method="momo",
                notes="Đặt sân sáng"
            ),
            Booking(
                user_id=2,
                facility_id=2,
                court_id=1,
                booking_date=datetime(2025, 8, 22, 18, 0, 0),
                start_time=datetime(2025, 8, 22, 18, 0, 0),
                end_time=datetime(2025, 8, 22, 20, 0, 0),
                total_price=400000,
                status="pending",
                payment_status="unpaid",
                payment_method="cash",
                notes="Đặt sân chiều"
            ),
            Booking(
                user_id=3,
                facility_id=1,
                court_id=1,
                booking_date=datetime(2025, 8, 23, 14, 0, 0),
                start_time=datetime(2025, 8, 23, 14, 0, 0),
                end_time=datetime(2025, 8, 23, 16, 0, 0),
                total_price=300000,
                status="cancelled",
                payment_status="refunded",
                payment_method="momo",
                notes="Khách hủy"
            )
        ]
        db.add_all(bookings)
        db.commit()
        print("✅ Seeded booking data")
    else:
        print("ℹ️ Bookings already exist")

def init_db():
    # Tạo bảng nếu chưa có
    Base.metadata.create_all(bind=engine, checkfirst=True)

    db: Session = SessionLocal()
    try:
        seed_users(db)
        seed_facilities(db)
        seed_bookings(db)
        seed_notifications(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()