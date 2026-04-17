Sau khi tải dự án 
1) npm install
vào MySQL tạo bảng để có user đăng nhập
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'User',
    IsActive BIT DEFAULT 1
);
Sau đó chạy 1 lần duy nhất:
python create_user.py