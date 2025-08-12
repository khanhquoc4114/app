# Hệ thống Quản lý Sân Thể thao

Ứng dụng web quản lý và đặt sân thể thao, xây dựng bằng React và FastAPI.

## Tính năng

- 🏟️ Quản lý sân thể thao (cầu lông, bóng đá, tennis...)
- �  Đăng ký, đăng nhập người dùng
- � Đặt sân ttrực tuyến (sắp có)
- 💳 Thanh toán online (sắp có)
- 🤖 Chatbot hỗ trợ (sắp có)

## Công nghệ sử dụng

- **Frontend**: React, Ant Design
- **Backend**: FastAPI, PostgreSQL
- **Deployment**: Docker

## Cách chạy dự án

```bash
# Tải code về
git clone <link-repo>
cd sports-facility-management

# Chạy tất cả services
docker-compose up -d

# Tạo database và dữ liệu mẫu
docker-compose exec backend python init_db.py
```

Xong! Truy cập:
- **Trang web**: http://localhost:3000
- **API**: http://localhost:8000/docs

## Tài khoản mẫu

Sau khi chạy `init_db.py`:

- **Admin**: `admin` / `admin123`
- **User**: `user1` / `user123`

## Cấu trúc dự án

```
├── backend/           # API server (FastAPI)
├── frontend/          # Giao diện web (React)
├── docker-compose.yml # Cấu hình Docker

```

## API có sẵn

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user

## Cấu hình

Copy file `backend/.env.example` thành `backend/.env` và sửa:

```env
DB_USER=sports_user
DB_PASSWORD=sports_password
DB_HOST=localhost
DB_NAME=sports_facility_db
SECRET_KEY=your-secret-key
```


## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

