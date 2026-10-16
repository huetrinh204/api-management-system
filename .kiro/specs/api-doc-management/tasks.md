# Tasks

## Giai đoạn 1: Nền tảng

- [-] 1. Khởi tạo Backend (Express + TypeScript + Sequelize)
  - [-] 1.1 Tạo thư mục `backend/`, khởi tạo `package.json` và cài dependencies
  - [x] 1.2 Cấu hình `tsconfig.json`
  - [x] 1.3 Tạo `src/config/database.ts` kết nối Sequelize + MySQL
  - [x] 1.4 Tạo `src/app.ts` với Express cơ bản
  - [x] 1.5 Tạo `.env.example` với tất cả biến môi trường cần thiết
  - [x] 1.6 Đảm bảo `.env` có trong `.gitignore`

- [x] 2. Tạo Sequelize Models (4 bảng)
  - [x] 2.1 Tạo model `User` (id, name, email, password_hash, role, timestamps)
  - [x] 2.2 Tạo model `ApiDoc` (id, name, method, endpoint, description, request_sample, response_sample, status, created_by, timestamps, paranoid/deleted_at)
  - [x] 2.3 Tạo model `Issue` (id, api_doc_id, title, description, priority, status, created_by, assigned_to, timestamps)
  - [x] 2.4 Tạo model `Comment` (id, content, user_id, api_doc_id, issue_id, timestamps)
  - [x] 2.5 Tạo `src/models/index.ts` định nghĩa associations giữa các model

- [-] 3. Tạo Migrations (4 bảng)
  - [x] 3.1 Migration tạo bảng `users`
  - [x] 3.2 Migration tạo bảng `api_docs` với `deleted_at` và các index
  - [x] 3.3 Migration tạo bảng `issues` với các FK và index
  - [ ] 3.4 Migration tạo bảng `comments` với CHECK constraint và index

- [x] 4. Tạo Seed data (4 tài khoản demo)
  - [x] 4.1 Tạo seeder với 4 user (BA, Backend Developer, Frontend Developer, Tester), mật khẩu hash bcrypt

- [x] 5. Khởi tạo Frontend (React + TypeScript + Vite)
  - [x] 5.1 Tạo thư mục `frontend/` bằng Vite template react-ts
  - [x] 5.2 Tạo cấu trúc thư mục `src/api`, `src/components`, `src/pages`, `src/hooks`, `src/store`, `src/types`
  - [x] 5.3 Tạo `.env.example` với `VITE_API_BASE_URL`
  - [x] 5.4 Cài thêm `axios` và `react-router-dom`

- [x] 6. Tạo README.md
  - [x] 6.1 Viết hướng dẫn cài đặt, cấu hình, chạy migration, seed và khởi động dự án
  - [x] 6.2 Liệt kê thông tin đăng nhập 4 tài khoản demo

## Giai đoạn 2: Auth Backend

- [x] 7. Implement Auth API
  - [x] 7.1 Tạo `authService.ts`: login (so sánh bcrypt, trả JWT), getMe
  - [x] 7.2 Tạo `authController.ts` và `routes/auth.ts`
  - [x] 7.3 Tạo middleware `auth.ts` xác thực JWT
  - [x] 7.4 Tạo middleware `requireRole.ts` kiểm tra role
  - [x] 7.5 Tạo middleware `errorHandler.ts` global error handler

## Giai đoạn 3: API Doc CRUD

- [ ] 8. Implement API Doc endpoints (Backend)
  - [x] 8.1 GET /api/api-docs (danh sách + filter)
  - [x] 8.2 POST /api/api-docs (tạo mới)
  - [x] 8.3 GET /api/api-docs/:id (chi tiết)
  - [ ] 8.4 PUT /api/api-docs/:id (cập nhật)
  - [x] 8.5 DELETE /api/api-docs/:id (soft delete)

- [ ] 9. Frontend: Trang API Doc
  - [x] 9.1 Login page + Auth context
  - [x] 9.2 API Doc list page (có filter)
  - [x] 9.3 API Doc detail page
  - [x] 9.4 Form tạo/sửa API Doc

## Giai đoạn 4: Issue & Comment

- [-] 10. Implement Issue endpoints (Backend)
  - [x] 10.1 GET /api/issues (tổng thể)
  - [x] 10.2 GET /api/api-docs/:id/issues
  - [x] 10.3 POST /api/api-docs/:id/issues
  - [x] 10.4 GET /api/issues/:issueId
  - [x] 10.5 PUT /api/issues/:issueId
  - [x] 10.6 PATCH /api/issues/:issueId/status

- [ ] 11. Implement Comment endpoints (Backend)
  - [x] 11.1 GET + POST /api/api-docs/:id/comments
  - [x] 11.2 GET + POST /api/issues/:issueId/comments
  - [x] 11.3 DELETE /api/comments/:commentId

- [ ] 12. Frontend: Trang Issue & Comment
  - [ ] 12.1 Issue list page (tổng thể + lọc)
  - [x] 12.2 Issue detail page + comment section
  - [x] 12.3 Form tạo issue, chuyển trạng thái

## Giai đoạn 5: Hoàn thiện

- [x] 13. Kiểm tra toàn bộ phân quyền Backend
- [x] 14. Kiểm thử thủ công các luồng chính
