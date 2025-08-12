#!/usr/bin/env python3
"""
Script để khởi tạo database và tạo dữ liệu mẫu
Chạy: python init_db.py
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import bcrypt

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, get_db
from models import User, Facility, Booking

def create_database():
    """Tạo database nếu chưa tồn tại"""
    # Database connection string
    DB_USER = os.getenv("DB_USER", "sports_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "sports_password")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_NAME = os.getenv("DB_NAME", "sports_facility_db")
    
    # Connect to PostgreSQL server (not specific database)
    server_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/postgres"
    db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    
    try:
        # Try to connect to the database
        engine = create_engine(db_url)
        engine.connect()
        print(f"✅ Database '{DB_NAME}' already exists")
        return engine
    except OperationalError:
        print(f"❌ Database '{DB_NAME}' doesn't exist. Creating...")
        
        try:
            # Connect to server and create database
            server_engine = create_engine(server_url)
            with server_engine.connect() as conn:
                conn.execute(text("COMMIT"))  # End any existing transaction
                conn.execute(text(f"CREATE DATABASE {DB_NAME}"))
            print(f"✅ Database '{DB_NAME}' created successfully")
            
            # Return engine for the new database
            return create_engine(db_url)
        except Exception as e:
            print(f"❌ Error creating database: {e}")
            print("\n🔧 Manual setup required:")
            print(f"1. Create PostgreSQL user: CREATE USER {DB_USER} WITH PASSWORD '{DB_PASSWORD}';")
            print(f"2. Create database: CREATE DATABASE {DB_NAME} OWNER {DB_USER};")
            print(f"3. Grant privileges: GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};")
            sys.exit(1)

def create_tables(engine):
    """Tạo các bảng"""
    print("📋 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

def create_sample_data(engine):
    """Tạo dữ liệu mẫu"""
    print("📝 Creating sample data...")
    
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Tạo admin user
        admin_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        admin_user = User(
            username="admin",
            email="admin@example.com",
            full_name="Administrator",
            hashed_password=admin_password.decode('utf-8'),
            role="admin"
        )
        
        # Tạo user thường
        user_password = bcrypt.hashpw("user123".encode('utf-8'), bcrypt.gensalt())
        normal_user = User(
            username="user1",
            email="user1@example.com",
            full_name="Nguyễn Văn A",
            hashed_password=user_password.decode('utf-8'),
            role="user"
        )
        
        db.add(admin_user)
        db.add(normal_user)
        
        # Tạo sân mẫu
        facilities = [
            Facility(
                name="Sân cầu lông A1",
                sport_type="badminton",
                description="Sân cầu lông chất lượng cao với sàn gỗ",
                price_per_hour=50000,
                image_url="/images/badminton-1.jpg"
            ),
            Facility(
                name="Sân bóng đá mini B1",
                sport_type="football",
                description="Sân bóng đá mini 5v5 với cỏ nhân tạo",
                price_per_hour=200000,
                image_url="/images/football-1.jpg"
            ),
            Facility(
                name="Sân tennis C1",
                sport_type="tennis",
                description="Sân tennis tiêu chuẩn quốc tế",
                price_per_hour=100000,
                image_url="/images/tennis-1.jpg"
            )
        ]
        
        for facility in facilities:
            db.add(facility)
        
        db.commit()
        print("✅ Sample data created successfully")
        print("\n👤 Sample accounts:")
        print("Admin: admin / admin123")
        print("User: user1 / user123")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("🚀 Initializing Sports Facility Database...")
    
    # Create database
    engine = create_database()
    
    # Create tables
    create_tables(engine)
    
    # Create sample data
    create_sample_data(engine)
    
    print("\n🎉 Database initialization completed!")
    print("You can now run: uvicorn main:app --reload")

if __name__ == "__main__":
    main()