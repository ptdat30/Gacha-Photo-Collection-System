# Hướng dẫn sửa lỗi Role - Từng bước một

## Vấn đề
Lỗi: `Data truncated for column 'role' at row 1`

Nguyên nhân: Có dữ liệu role không hợp lệ trong bảng users, MySQL không thể xử lý.

## Giải pháp

### Mở file: `fix_role_step_by_step.sql`

### Chạy TỪNG BƯỚC một, không chạy tất cả cùng lúc:

---

### **BƯỚC 1** (BẮT BUỘC - Chạy đầu tiên)
```sql
ALTER TABLE users 
MODIFY COLUMN role VARCHAR(20) DEFAULT 'MEMBER';
```
**Mục đích:** Tạm thời chuyển role thành VARCHAR để có thể sửa dữ liệu

**Kiểm tra:** Nếu chạy thành công, chuyển sang BƯỚC 2

---

### **BƯỚC 2** (Kiểm tra)
```sql
SELECT user_id, username, email, role FROM users;
```
**Mục đích:** Xem dữ liệu hiện tại

**Kiểm tra:** Xem có giá trị role nào lạ không (không phải MEMBER, CONTENT_ADMIN, SYSTEM_ADMIN)

---

### **BƯỚC 3** (Sửa dữ liệu)
Chạy từng câu một:

**3a. Nếu có 'ADMIN' cũ:**
```sql
UPDATE users SET role = 'SYSTEM_ADMIN' WHERE role = 'ADMIN';
```

**3b. Sửa các giá trị không hợp lệ:**
```sql
UPDATE users SET role = 'MEMBER' 
WHERE role IS NULL 
   OR role NOT IN ('MEMBER', 'CONTENT_ADMIN', 'SYSTEM_ADMIN');
```

**Kiểm tra:** Chạy BƯỚC 4 để xem kết quả

---

### **BƯỚC 4** (Kiểm tra lại)
```sql
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```
**Mục đích:** Xác nhận chỉ còn 3 giá trị: MEMBER, CONTENT_ADMIN, SYSTEM_ADMIN

**Kiểm tra:** Nếu chỉ thấy 3 giá trị trên, chuyển sang BƯỚC 5

---

### **BƯỚC 5** (Chuyển lại thành ENUM)
```sql
ALTER TABLE users 
MODIFY COLUMN role ENUM('MEMBER', 'CONTENT_ADMIN', 'SYSTEM_ADMIN') DEFAULT 'MEMBER';
```
**Mục đích:** Chuyển lại thành ENUM với 3 giá trị hợp lệ

**Kiểm tra:** Nếu chạy thành công, xong!

---

### **BƯỚC 6** (Kiểm tra cuối)
```sql
SELECT user_id, username, email, role FROM users;
```
**Mục đích:** Xem kết quả cuối cùng

---

## Lưu ý quan trọng:

1. **CHỈ CHẠY TỪNG BƯỚC MỘT** - Không chạy tất cả cùng lúc
2. **Kiểm tra kết quả** sau mỗi bước trước khi chuyển bước tiếp theo
3. **Nếu lỗi ở bước nào**, dừng lại và báo lỗi cụ thể
4. **Backup database** trước khi chạy (nếu có dữ liệu quan trọng)

## Nếu vẫn lỗi:

Gửi thông báo lỗi cụ thể ở bước nào để được hỗ trợ tiếp.

