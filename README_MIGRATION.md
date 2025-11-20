# Hướng dẫn Migration Database

## Các file migration có sẵn:

### 1. `migration_all_in_one.sql` ⭐ (KHUYẾN NGHỊ)
- **File này chứa TẤT CẢ** các thay đổi cần thiết
- Cập nhật Rarity ENUM (8 cấp độ)
- Thêm 10 Bộ Sưu Tập
- Cập nhật Drop Rate Config
- **Chạy file này là đủ!**

### 2. `migration_update_rarity.sql`
- Chỉ cập nhật Rarity ENUM và Drop Rate Config
- Dùng nếu chỉ muốn cập nhật rarity

### 3. `migration_add_collections.sql`
- Chỉ thêm 10 Bộ Sưu Tập
- Dùng nếu đã cập nhật rarity rồi

## Cách chạy Migration:

### Cách 1: Sử dụng MySQL Command Line
```bash
mysql -u root -p memories_gacha < migration_all_in_one.sql
```

### Cách 2: Sử dụng MySQL Workbench / phpMyAdmin
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Chọn database `memories_gacha`
3. Mở file `migration_all_in_one.sql`
4. Copy toàn bộ nội dung
5. Paste vào query window
6. Click "Execute" hoặc nhấn Ctrl+Enter

### Cách 3: Sử dụng IntelliJ IDEA Database Tool
1. Mở Database tool window (View → Tool Windows → Database)
2. Kết nối đến database `memories_gacha`
3. Right-click vào database → SQL Scripts → Run SQL Script
4. Chọn file `migration_all_in_one.sql`
5. Click Run

### Cách 4: Chạy từng câu lệnh
Nếu gặp lỗi, có thể mở file và chạy từng câu lệnh một để kiểm tra lỗi cụ thể.

## Kiểm tra kết quả:

Sau khi chạy migration, kiểm tra bằng các câu lệnh sau:

```sql
-- Kiểm tra Collections
SELECT * FROM collections;

-- Kiểm tra Drop Rate Config
SELECT * FROM drop_rate_config ORDER BY drop_rate DESC;

-- Kiểm tra Rarity trong Photos
SELECT rarity, COUNT(*) as count FROM photos GROUP BY rarity;
```

## Lưu ý:

1. **Backup database trước khi chạy migration** (nếu có dữ liệu quan trọng)
2. Nếu gặp lỗi "Duplicate entry", có thể collections đã tồn tại → bỏ qua hoặc xóa dữ liệu cũ trước
3. Nếu gặp lỗi về ENUM, có thể cần xóa dữ liệu cũ trong các bảng trước khi ALTER TABLE

## Troubleshooting:

### Lỗi: "Duplicate entry for key"
- Collections đã tồn tại → Bỏ qua hoặc xóa dữ liệu cũ

### Lỗi: "Data truncated for column 'rarity'"
- Có dữ liệu cũ không hợp lệ → Cần cập nhật dữ liệu cũ trước:
```sql
-- Cập nhật tất cả rarity cũ thành 'C' (Common)
UPDATE photos SET rarity = 'C' WHERE rarity NOT IN ('N', 'C', 'R', 'SR', 'SSR', 'UR', 'L', 'X');
```

### Lỗi: "Cannot add foreign key constraint"
- Kiểm tra xem bảng `users` có dữ liệu chưa
- Nếu chưa có admin user, tạo trước:
```sql
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@class.com', 'temp_hash', 'SYSTEM_ADMIN');
```

