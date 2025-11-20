# Hướng dẫn Upload Ảnh vào Album

## Cách 1: Upload qua Admin Panel (Khuyến nghị)

1. **Đăng nhập với tài khoản Admin** (SYSTEM_ADMIN hoặc CONTENT_ADMIN)
2. Vào trang **Quản trị** → Tab **Quản lý Ảnh**
3. Click nút **"+ Upload Ảnh Mới"**
4. Chọn file ảnh từ máy tính
5. Chọn **Độ hiếm** (N, C, R, SR, SSR, UR, L, X)
6. Chọn **Bộ sưu tập** (nhập ID của collection, hoặc để trống)
7. Click **Upload**

Ảnh sẽ được:
- Lưu vào thư mục `backend/uploads/images/`
- Tự động tạo record trong database
- Có thể truy cập qua URL: `http://localhost:8080/api/images/{filename}`

---

## Cách 2: Upload trực tiếp vào thư mục và thêm vào Database

### Bước 1: Copy ảnh vào thư mục

Copy ảnh vào thư mục:
```
backend/uploads/images/
```

### Bước 2: Thêm vào Database

Chạy SQL để thêm ảnh vào database:

```sql
USE memories_gacha;

-- Thêm ảnh mới
INSERT INTO photos (image_url, rarity, status, uploaded_by) VALUES 
('http://localhost:8080/api/images/ten_anh.jpg', 'SR', 'ACTIVE', 1);

-- Gán vào bộ sưu tập (nếu muốn)
UPDATE photos 
SET collection_id = 1  -- ID của collection
WHERE photo_id = LAST_INSERT_ID();
```

---

## Cách 3: Sử dụng API trực tiếp

### Upload ảnh:
```bash
POST http://localhost:8080/api/upload/image
Content-Type: multipart/form-data

file: [chọn file ảnh]
```

Response:
```json
{
  "url": "/api/images/uuid-filename.jpg",
  "filename": "uuid-filename.jpg",
  "message": "Upload successful"
}
```

### Tạo photo record:
```bash
POST http://localhost:8080/api/admin/photos
Headers:
  Authorization: Bearer {token}
  X-User-Id: {admin_id}
Content-Type: application/json

{
  "imageUrl": "http://localhost:8080/api/images/uuid-filename.jpg",
  "rarity": "SR",
  "collectionId": 1
}
```

---

## Cấu trúc thư mục

```
backend/
  └── uploads/
      └── images/
          ├── uuid-1.jpg
          ├── uuid-2.png
          └── ...
```

---

## Lưu ý

1. **Kích thước file**: Tối đa 10MB (có thể chỉnh trong `application.properties`)
2. **Định dạng**: Hỗ trợ tất cả định dạng ảnh (jpg, png, gif, webp, ...)
3. **URL truy cập**: Ảnh có thể truy cập qua `http://localhost:8080/api/images/{filename}`
4. **Thư mục upload**: Tự động tạo nếu chưa có
5. **Tên file**: Tự động tạo UUID để tránh trùng lặp

---

## Troubleshooting

### Ảnh không hiển thị?
- Kiểm tra file có trong `backend/uploads/images/` không
- Kiểm tra URL trong database có đúng format không
- Kiểm tra Spring Boot có chạy không

### Lỗi upload?
- Kiểm tra quyền ghi vào thư mục `uploads/`
- Kiểm tra kích thước file (max 10MB)
- Kiểm tra log trong console

### Ảnh bị mất sau khi restart?
- Ảnh được lưu local, không mất khi restart
- Nếu mất, có thể do xóa thư mục hoặc rebuild project

