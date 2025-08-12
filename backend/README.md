# Backend - API Server

FastAPI server cho hệ thống quản lý sân thể thao.

## Cài đặt

### 1. Cài PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows: Tải từ postgresql.org
```

### 2. Tạo database
```bash
sudo -u postgres psql
```

Trong PostgreSQL:
```sql
CREATE USER sports_user WITH PASSWORD 'sports_password';
CREATE DATABASE sports_facility_db OWNER sports_user;
GRANT ALL PRIVILEGES ON DATABASE sports_facility_db TO sports_user;
\q
```

### 3. Cài Python packages
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 4. Tạo database và dữ liệu mẫu
```bash
python init_db.py
```

### 5. Chạy server
```bash
uvicorn main:app --reload --port 8000
```

## Tài khoản mẫu
- **Admin**: `admin` / `admin123`
- **User**: `user1` / `user123`

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Cấu hình
Tạo file `.env`:
```
DB_USER=sports_user
DB_PASSWORD=sports_password
DB_HOST=localhost
DB_NAME=sports_facility_db
SECRET_KEY=your-secret-key
```