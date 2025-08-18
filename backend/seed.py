from sqlalchemy.orm import Session
from models import Base, Facility
from database import engine, SessionLocal

def init_db():
    # Tạo bảng nếu chưa có
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # Kiểm tra xem đã có dữ liệu chưa
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
                name="Sân bóng đá 2 ",
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
        print("ℹ️ Facilities already seeded")

    db.close()

if __name__ == "__main__":
    init_db()
