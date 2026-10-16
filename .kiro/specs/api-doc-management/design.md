# Tài liệu Thiết kế (Design Document)

## Tổng quan kiến trúc

Dự án gồm 2 ứng dụng độc lập chạy trên 2 port khác nhau, giao tiếp qua REST API:

```
Frontend (React+Vite :5173)  ←→  Backend (Express :3000)  ←→  MySQL 8
```

---

## Cấu trúc thư mục

### Backend

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # Khởi tạo Sequelize, đọc .env
│   ├── middlewares/
│   │   ├── auth.ts            # Xác thực JWT
│   │   ├── requireRole.ts     # Kiểm tra role
│   │   └── errorHandler.ts    # Global error handler
│   ├── models/
│   │   ├── index.ts           # Export tất cả models + associations
│   │   ├── User.ts
│   │   ├── ApiDoc.ts
│   │   ├── Issue.ts
│   │   └── Comment.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── apiDocController.ts
│   │   ├── issueController.ts
│   │   └── commentController.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── apiDocs.ts
│   │   ├── issues.ts
│   │   └── comments.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── apiDocService.ts
│   │   ├── issueService.ts
│   │   └── commentService.ts
│   └── app.ts                 # Express app setup
├── migrations/                # Sequelize migrations (4 file)
├── seeders/                   # Seed 4 tài khoản demo
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.ts           # Axios instance + interceptors
│   │   ├── authApi.ts
│   │   ├── apiDocApi.ts
│   │   ├── issueApi.ts
│   │   └── commentApi.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── ApiDocListPage.tsx
│   │   ├── ApiDocDetailPage.tsx
│   │   ├── IssueListPage.tsx
│   │   └── IssueDetailPage.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── store/
│   │   └── authContext.tsx    # Auth context (user, token, role)
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

---

## Database Schema

### Quan hệ giữa các bảng

```
users (1) ──< api_docs (created_by)
users (1) ──< issues (created_by)
users (1) ──< issues (assigned_to) [nullable]
users (1) ──< comments (user_id)
api_docs (1) ──< issues (api_doc_id)
api_docs (1) ──< comments (api_doc_id) [nullable]
issues (1) ──< comments (issue_id) [nullable]
```

### Ghi chú quan trọng

- `api_docs.deleted_at`: NULL = chưa xóa, có giá trị = đã xóa mềm. Sequelize paranoid mode.
- `comments`: CHECK constraint đảm bảo đúng một trong hai `api_doc_id`/`issue_id` có giá trị.
- `issues.api_doc_id`: Giữ FK kể cả khi api_doc bị soft delete — issue lịch sử không mất.

---

## Luồng xác thực (Auth Flow)

```
1. POST /api/auth/login  →  so sánh bcrypt  →  trả JWT (24h)
2. Client lưu JWT vào localStorage
3. Mọi request tiếp theo gửi header: Authorization: Bearer <token>
4. Middleware auth.ts decode JWT, gắn req.user = { id, email, role }
5. Middleware requireRole.ts kiểm tra role nếu endpoint có giới hạn
```

---

## State Machine Issue

```
Open → In Progress  (tất cả role)
In Progress → Resolved  (tất cả role)
Resolved → Closed  (BA, Tester)
Resolved → Reopened  (Tester)
Reopened → In Progress  (tất cả role)
Closed → (không đổi)
```

---

## Biến môi trường Backend (.env)

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=api_doc_management
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
```

## Biến môi trường Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3000
```
