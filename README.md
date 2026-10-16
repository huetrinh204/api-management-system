# API Documentation Management System

Website quản lý tài liệu API nội bộ cho 4 vai trò: BA, Backend Developer, Frontend Developer, Tester.

## Yêu cầu môi trường

- Node.js >= 18
- MySQL 8.0
- npm >= 9

---

## Cài đặt

### 1. Clone và cài dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Tạo database MySQL

```sql
CREATE DATABASE api_doc_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình biến môi trường

```bash
# Backend
cd backend
cp .env.example .env
# Sửa .env: điền DB_USER, DB_PASS, JWT_SECRET

# Frontend
cd ../frontend
cp .env.example .env
# Mặc định VITE_API_BASE_URL=http://localhost:3000, không cần sửa nếu chạy local
```

Nội dung `backend/.env`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=api_doc_management
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=any_random_long_string_here
JWT_EXPIRES_IN=24h
```

### 4. Chạy migration (tạo 4 bảng)

```bash
cd backend
npm run db:migrate
```

### 5. Seed 4 tài khoản demo

```bash
cd backend
npm run db:seed
```

### 6. Khởi động

```bash
# Terminal 1 - Backend (chạy ở cổng 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (chạy ở cổng 5173)
cd frontend
npm run dev
```

Truy cập: http://localhost:5173

---

## Tài khoản demo

| Vai trò            | Email                   | Mật khẩu    |
|--------------------|-------------------------|-------------|
| BA                 | ba@example.com          | password123 |
| Backend Developer  | backend@example.com     | password123 |
| Frontend Developer | frontend@example.com    | password123 |
| Tester             | tester@example.com      | password123 |

---

## Cấu trúc dự án

```
api-management-system/
├── backend/          # Node.js + Express + TypeScript + Sequelize
├── frontend/         # React + TypeScript + Vite
└── README.md
```

---

## Lệnh hữu ích

```bash
# Undo toàn bộ migration (xóa bảng)
cd backend && npm run db:migrate:undo

# Undo seed (xóa user demo)
cd backend && npm run db:seed:undo
```

---

## Công nghệ sử dụng

- **Frontend**: React 18, TypeScript, Vite, Axios, React Router v6
- **Backend**: Node.js, Express.js, TypeScript, Sequelize ORM
- **Database**: MySQL 8
- **Auth**: JWT (jsonwebtoken), bcryptjs
