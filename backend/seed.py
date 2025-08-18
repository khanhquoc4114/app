from sqlalchemy.orm import Session
from models import Base, Facility, Notification
from database import engine, SessionLocal
from datetime import datetime, timedelta


def seed_facilities(db: Session):
    if db.query(Facility).count() == 0:
        facilities = [
            Facility(
                name="Sân cầu lông 54",
                sport_type="badminton",
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
                sport_type="football",
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
                sport_type="tennis",
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
                sport_type="basketball",
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
                type="booking_confirmed",
                title="Đặt sân thành công",
                message="Đặt sân cầu lông VIP 1 vào ngày 20/01/2024 lúc 08:00-10:00 đã được xác nhận.",
                timestamp=datetime.utcnow() - timedelta(minutes=5),
                read=False,
                priority="high",
                data={"bookingId": "BK001", "facilityName": "Sân cầu lông VIP 1"}
            ),
            Notification(
                type="payment_success",
                title="Thanh toán thành công ok chưa",
                message="Thanh toán 160,000 VNĐ cho đặt sân BK001 đã được xử lý thành công.",
                timestamp=datetime.utcnow() - timedelta(minutes=10),
                read=False,
                priority="medium",
                data={"amount": 160000, "bookingId": "BK001"}
            ),
            Notification(
                type="booking_reminder",
                title="Nhắc nhở đặt sân",
                message="Bạn có lịch đặt sân tennis vào 14:00 hôm nay. Vui lòng đến đúng giờ.",
                timestamp=datetime.utcnow() - timedelta(hours=1),
                read=True,
                priority="medium",
                data={"facilityName": "Sân tennis cao cấp", "time": "14:00"}
            ),
            Notification(
                type="promotion",
                title="Khuyến mãi đặc biệt",
                message="Giảm 20% cho tất cả sân cầu lông vào cuối tuần. Áp dụng từ 22-23/01/2024.",
                timestamp=datetime.utcnow() - timedelta(hours=2),
                read=True,
                priority="low",
                data={"discount": 20, "validUntil": "23/01/2024"}
            ),
            Notification(
                type="system",
                title="Bảo trì hệ thống",
                message="Hệ thống sẽ bảo trì từ 02:00-04:00 ngày 21/01/2024. Vui lòng hoàn tất giao dịch trước thời gian này.",
                timestamp=datetime.utcnow() - timedelta(days=1),
                read=False,
                priority="high",
                data={"maintenanceTime": "02:00-04:00", "date": "21/01/2024"}
            )
        ]
        db.add_all(sample_notifications)
        db.commit()
        print("✅ Seeded notifications data")
    else:
        print("ℹ️ Notifications already exist")

def init_db():
    # Tạo bảng nếu chưa có
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        seed_facilities(db)
        seed_notifications(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()