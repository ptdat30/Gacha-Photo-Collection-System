# Memories Gacha System

Hệ thống Sưu tầm & Lưu trữ Kỷ niệm Lớp học - Class Memory Collection & Storage System

## 🎯 Mô tả dự án

Memories Gacha System là một ứng dụng web cho phép học sinh thu thập và lưu trữ những khoảnh khắc kỷ niệm của lớp học thông qua cơ chế Gacha game độc đáo.

## 🛠️ Công nghệ sử dụng

### Backend
- **Spring Boot 3.2.0** - Framework Java
- **Maven** - Dependency Management
- **MySQL** - Database
- **Spring Data JPA** - ORM
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **React Router** - Routing
- **Axios** - HTTP Client

## 📁 Cấu trúc dự án

```
GachaPhoto/
├── backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/memories/gacha/
│   │   │   │   ├── model/          # Entity classes
│   │   │   │   ├── repository/     # JPA Repositories
│   │   │   │   ├── service/        # Business logic
│   │   │   │   ├── controller/     # REST Controllers
│   │   │   │   └── config/         # Configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/          # Page Components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── database_schema.sql      # MySQL Database Schema
└── README.md
```

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. Tạo database MySQL:
```sql
mysql -u root -p < database_schema.sql
```

2. Cấu hình database trong `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Chạy Spring Boot:
```bash
cd backend
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### Frontend Setup

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📝 API Endpoints

### Users
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/{id}` - Lấy user theo ID
- `GET /api/users/username/{username}` - Lấy user theo username

### Photos
- `GET /api/photos` - Lấy danh sách photos
- `GET /api/photos/active` - Lấy photos đang active
- `GET /api/photos/{id}` - Lấy photo theo ID
- `GET /api/photos/rarity/{rarity}` - Lấy photos theo rarity

### Collections
- `GET /api/collections` - Lấy danh sách collections
- `GET /api/collections/{id}` - Lấy collection theo ID

## 🎮 Tính năng chính

- ✅ Hệ thống Gacha (Quay đơn/Quay 10)
- ✅ Album Kỷ niệm với độ hiếm (C, R, SR, UR)
- ✅ Bộ sưu tập ảnh
- ✅ Tương tác xã hội (Like, Comment, Tag)
- ✅ Chợ giao dịch
- ✅ Nhiệm vụ hàng ngày
- ✅ Chức năng chuộc ảnh

## 📄 License

MIT License

## 👥 Contributors

- Development Team

