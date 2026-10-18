<div align="center">
  <img src="frontend/public/logo.png" alt="API Hub logo" width="210" />
  <h1>API Documentation Management System</h1>
  <p><strong>Nền tảng cộng tác để quản lý dự án, tài liệu API và quy trình xử lý issue trong một workspace.</strong></p>
  <p>React · TypeScript · Node.js · Express · MySQL</p>
</div>

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Chức năng chính](#chức-năng-chính)
- [Vai trò và quyền hạn](#vai-trò-và-quyền-hạn)
- [Cách sử dụng](#cách-sử-dụng)
- [Cài đặt và chạy local](#cài-đặt-và-chạy-local)
- [Tài khoản demo](#tài-khoản-demo)
- [REST API](#rest-api)
- [Công nghệ](#công-nghệ)
- [Cấu trúc repository](#cấu-trúc-repository)
- [Build](#build)

## Tổng quan

**API Hub** là ứng dụng web nội bộ giúp các nhóm BA, Backend, Frontend và Tester tập trung hóa tài liệu API và phối hợp trong suốt vòng đời phát triển. Thành viên có thể tổ chức tài liệu theo dự án, ghi lại mẫu request/response, theo dõi issue liên quan và trao đổi ngay tại tài liệu hoặc issue.

Hệ thống gồm giao diện web React và REST API viết bằng Express. Dữ liệu được lưu trong MySQL; các API nghiệp vụ được bảo vệ bằng JWT và kiểm soát quyền theo vai trò.

## Chức năng chính

- **Quản lý dự án:** tạo, chỉnh sửa, tìm kiếm và lưu trữ dự án; mã dự án được chuẩn hóa thành chữ in hoa.
- **Quản lý tài liệu API:** ghi method, endpoint, mô tả, trạng thái, dự án liên quan và mẫu JSON request/response.
- **Tìm kiếm và lọc:** tìm dự án, tài liệu theo từ khóa; lọc tài liệu theo method, trạng thái hoặc dự án.
- **Theo dõi issue:** tạo issue từ tài liệu API, đặt mức ưu tiên, phân công người xử lý và cập nhật trạng thái theo workflow.
- **Trao đổi theo ngữ cảnh:** bình luận trực tiếp trên tài liệu API hoặc issue; người tạo bình luận có thể xóa bình luận của mình.
- **Quản trị người dùng:** Admin tạo và cập nhật tài khoản, lọc theo vai trò/trạng thái, khóa hoặc mở khóa tài khoản.
- **Cài đặt cá nhân:** cập nhật tên, đổi mật khẩu và chuyển giao diện sáng/tối.
- **Giao diện responsive:** bố cục dùng được trên desktop và màn hình nhỏ.

### Vòng đời dữ liệu

- Trạng thái dự án: **Active**, **Archived**.
- Trạng thái tài liệu API: **Draft**, **Active**, **Deprecated**.
- Mức ưu tiên issue: **Low**, **Medium**, **High**.
- Trạng thái issue: **Open → In Progress → Resolved → Closed**; issue ở trạng thái Resolved có thể được mở lại thành **Reopened** theo quyền.

## Vai trò và quyền hạn

| Vai trò | Quyền chính |
| --- | --- |
| **Admin** | Quản lý tài khoản người dùng và vai trò; xem workspace. |
| **BA** | Tạo/cập nhật dự án và tài liệu API; xóa dự án/tài liệu; phân công issue. |
| **Backend Developer** | Tạo/cập nhật dự án và tài liệu API; phân công issue. |
| **Frontend Developer** | Xem dự án/tài liệu; tạo issue và bình luận; tham gia workflow issue. |
| **Tester** | Xem dự án/tài liệu; tạo issue và bình luận; có thể đóng hoặc mở lại issue theo workflow. |

Tất cả người dùng đã đăng nhập có thể xem workspace, tạo issue và bình luận. Nội dung issue chỉ được chỉnh sửa bởi người tạo hoặc người được giao. Các chuyển trạng thái được kiểm tra ở backend:

- **Open → In Progress** và **In Progress → Resolved:** BA, Backend Developer, Frontend Developer hoặc Tester.
- **Resolved → Closed:** BA hoặc Tester.
- **Resolved → Reopened:** Tester.
- **Reopened → In Progress:** BA, Backend Developer, Frontend Developer hoặc Tester.

## Cách sử dụng

1. Đăng nhập bằng tài khoản được cấp.
2. Mở **Projects** để xem dự án, tìm dự án theo tên/mã hoặc tạo dự án (BA/Backend Developer).
3. Chọn dự án để xem tài liệu API; có thể tạo tài liệu mới hoặc gắn tài liệu vào dự án. Mỗi tài liệu có thể lưu mẫu JSON request và response.
4. Mở một tài liệu API để xem chi tiết, bình luận hoặc tạo issue gắn với endpoint đó.
5. Mở **Issues** để lọc và theo dõi issue; cập nhật người phụ trách, ưu tiên, nội dung hoặc trạng thái theo quyền được cấp.
6. Admin mở **User Management** để quản lý tài khoản. Khi tạo user mới, hệ thống hiển thị mật khẩu tạm thời một lần (mặc định <code>Welcome@123</code>); hãy lưu lại và cấp cho người dùng.
7. Mở **Settings** để đổi tên, đổi mật khẩu hoặc chọn giao diện sáng/tối.

## Cài đặt và chạy local

### Yêu cầu

- Node.js **18 trở lên**
- npm **9 trở lên**
- MySQL **8 trở lên**

### 1. Lấy mã nguồn và cài dependencies

Thay URL mẫu bằng URL repository nếu clone từ GitHub. Nếu nhận dự án dưới dạng ZIP, giải nén rồi mở terminal tại thư mục gốc.

~~~bash
git clone https://github.com/<username>/<repository>.git api-management-system
cd api-management-system

cd backend
npm install

cd ../frontend
npm install
cd ..
~~~

### 2. Tạo database

Tạo database trong MySQL:

~~~sql
CREATE DATABASE api_doc_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
~~~

### 3. Tạo và cấu hình file môi trường

Tại thư mục gốc, tạo file môi trường từ mẫu. Trên Windows PowerShell:

~~~powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
~~~

Trên macOS/Linux hoặc Git Bash, dùng <code>cp</code> thay cho <code>Copy-Item</code>.

Trong <code>backend/.env</code>, điền thông tin kết nối MySQL và một JWT secret riêng:

~~~dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=api_doc_management
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
~~~

Trong <code>frontend/.env</code>, giữ URL backend phù hợp với môi trường local:

~~~dotenv
VITE_API_BASE_URL=http://localhost:3000
~~~

Có thể đặt <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code> và <code>ADMIN_NAME</code> trong <code>backend/.env</code> trước khi seed để tùy chỉnh tài khoản Admin ban đầu. Nếu bỏ trống, seeder dùng thông tin mặc định được ghi ở phần tài khoản demo bên dưới.

### 4. Tạo bảng và dữ liệu mẫu

Từ thư mục backend, chạy migration trước, sau đó seed dữ liệu:

~~~bash
cd backend
npm run db:migrate
npm run db:seed
~~~

Migration tạo các bảng cho người dùng, dự án, tài liệu API, issue và bình luận. Seed tạo bốn tài khoản theo vai trò BA/Backend/Frontend/Tester cùng một tài khoản Admin. Chạy seed một lần trên database mới để tránh trùng email.

### 5. Khởi động ứng dụng

Mở hai terminal tại thư mục dự án.

**Terminal 1 — Backend**

~~~bash
cd backend
npm run dev
~~~

Backend mặc định chạy tại <code>http://localhost:3000</code>. Có thể kiểm tra trạng thái server tại <code>http://localhost:3000/health</code>.

**Terminal 2 — Frontend**

~~~bash
cd frontend
npm run dev
~~~

Mở <code>http://localhost:5173</code> để sử dụng API Hub.

## Tài khoản demo

Các tài khoản dưới đây được seed cho môi trường local. Nếu đã đặt biến <code>ADMIN_*</code>, dùng thông tin Admin do bạn cấu hình.

| Vai trò | Email | Mật khẩu mặc định |
| --- | --- | --- |
| Admin | <code>admin@apihub.com</code> | <code>Admin@123456</code> |
| BA | <code>ba@example.com</code> | <code>password123</code> |
| Backend Developer | <code>backend@example.com</code> | <code>password123</code> |
| Frontend Developer | <code>frontend@example.com</code> | <code>password123</code> |
| Tester | <code>tester@example.com</code> | <code>password123</code> |

Tài khoản mẫu chỉ dành cho demo/local. Không dùng mật khẩu mặc định hoặc tài khoản seed trong môi trường thật. Đổi thông tin Admin ngay sau lần đăng nhập đầu tiên.

## REST API

Các route nghiệp vụ yêu cầu JWT, gửi trong header:

~~~http
Authorization: Bearer <JWT_TOKEN>
~~~

| Nhóm | Endpoint chính | Mục đích |
| --- | --- | --- |
| Xác thực | <code>POST /api/auth/login</code>, <code>GET /api/auth/me</code> | Đăng nhập và lấy người dùng hiện tại. |
| Dự án | <code>/api/projects</code>, <code>/api/projects/:id</code> | Xem, tạo, cập nhật và xóa dự án; xem tài liệu theo dự án. |
| Tài liệu API | <code>/api/api-docs</code>, <code>/api/api-docs/:id</code> | Xem, tạo, cập nhật và xóa tài liệu API. |
| Issue | <code>/api/issues</code>, <code>/api/issues/:issueId</code>, <code>/api/api-docs/:id/issues</code> | Xem/cập nhật issue, tạo issue từ tài liệu API; cập nhật trạng thái qua <code>PATCH /api/issues/:issueId/status</code>. |
| Bình luận | <code>/api/api-docs/:id/comments</code>, <code>/api/issues/:issueId/comments</code> | Xem và thêm bình luận; xóa bình luận qua <code>DELETE /api/comments/:commentId</code>. |
| Tài khoản | <code>/api/users</code>, <code>/api/users/:id</code>, <code>/api/users/:id/status</code> | Quản lý người dùng và khóa/mở tài khoản; chỉ Admin được truy cập. |
| Hồ sơ | <code>/api/profile</code>, <code>/api/profile/change-password</code> | Xem/cập nhật hồ sơ và đổi mật khẩu. |

Các thao tác tạo/cập nhật/xóa và quyền theo vai trò được kiểm tra ở backend. Chi tiết payload có thể xem trong các API service và controller tương ứng dưới <code>backend/src</code>.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router 6, Axios |
| Backend | Node.js, Express 4, TypeScript |
| Database / ORM | MySQL 8, Sequelize 6, sequelize-cli |
| Xác thực | JWT, bcryptjs |
| Giao diện | CSS design system, theme sáng/tối |

## Cấu trúc repository

~~~text
api-management-system/
├── backend/
│   ├── migrations/        # Thay đổi schema database
│   ├── seeders/           # Tài khoản mẫu
│   └── src/
│       ├── config/        # Cấu hình database
│       ├── controllers/   # Xử lý HTTP request/response
│       ├── middlewares/   # JWT và phân quyền
│       ├── models/        # Sequelize models
│       ├── routes/        # REST API routes
│       └── services/      # Logic nghiệp vụ
├── frontend/
│   ├── public/            # Logo và tài nguyên tĩnh
│   └── src/
│       ├── api/           # Client gọi backend
│       ├── components/    # Thành phần giao diện dùng chung
│       ├── pages/         # Các trang ứng dụng
│       └── store/         # Auth và theme context
└── README.md
~~~

## Build

~~~bash
cd backend
npm run build

cd ../frontend
npm run build
~~~

Frontend build ra thư mục <code>frontend/dist</code>; backend TypeScript build theo cấu hình tại <code>backend/tsconfig.json</code>.

## Chia sẻ source code

Khi gửi dự án dưới dạng ZIP, giữ lại mã nguồn, migration, seeder, <code>package.json</code>, lockfile, logo và các file <code>.env.example</code>. Không đưa vào file <code>.env</code> cá nhân, thư mục <code>node_modules</code>, thư mục build <code>dist</code>, file cache <code>*.tsbuildinfo</code> hoặc log. Các file <code>.gitignore</code> ngăn những mục này được Git theo dõi; hãy kiểm tra nội dung ZIP riêng trước khi gửi.
