# Tài liệu Yêu cầu (Requirements Document)

## Giới thiệu

Website quản lý tài liệu API nội bộ cho phép các vai trò BA, Backend Developer, Frontend Developer và Tester/QA phối hợp làm việc trên cùng một nền tảng. Hệ thống hỗ trợ quản lý tài liệu API, bình luận theo từng API/issue, và theo dõi vòng đời issue từ khi phát hiện đến khi đóng.

Công nghệ: React + TypeScript + Vite (Frontend), Node.js + Express.js + TypeScript (Backend), MySQL 8 + Sequelize (Database).

---

## Bảng thuật ngữ (Glossary)

- **System**: Hệ thống website quản lý tài liệu API.
- **Auth_Service**: Thành phần xử lý xác thực và cấp token.
- **API_Doc**: Một bản ghi tài liệu API, bao gồm tên, method, endpoint, mô tả, request mẫu, response mẫu và trạng thái.
- **Issue**: Một bản ghi vấn đề được tạo liên quan đến một API_Doc, có tiêu đề, mô tả, mức ưu tiên, trạng thái, người tạo và người phụ trách.
- **Comment**: Một bản ghi bình luận gắn với một API_Doc hoặc một Issue cụ thể.
- **Role**: Vai trò của người dùng trong hệ thống. Gồm 4 giá trị: `BA`, `Backend Developer`, `Frontend Developer`, `Tester`.
- **User**: Người dùng đã được đăng ký trong hệ thống, có tài khoản và vai trò.
- **JWT**: JSON Web Token dùng để xác thực phiên đăng nhập.
- **Issue_Status**: Trạng thái của Issue. Gồm 5 giá trị: `Open`, `In Progress`, `Resolved`, `Closed`, `Reopened`.
- **API_Status**: Trạng thái của API_Doc. Gồm 3 giá trị: `Draft`, `Active`, `Deprecated`.
- **Priority**: Mức ưu tiên của Issue. Gồm 3 giá trị: `Low`, `Medium`, `High`.

---

## Yêu cầu (Requirements)

---

### Requirement 1: Đăng nhập và xác thực

**User Story:** Là một User, tôi muốn đăng nhập bằng tài khoản email và mật khẩu, để truy cập các chức năng nội bộ của hệ thống.

#### Acceptance Criteria

1. WHEN User gửi email và mật khẩu hợp lệ, THE Auth_Service SHALL trả về JWT có thời hạn 24 giờ.
2. IF User gửi email hoặc mật khẩu không đúng, THEN THE Auth_Service SHALL trả về HTTP 401 kèm thông báo lỗi rõ ràng.
3. WHILE User chưa cung cấp JWT hợp lệ trong header `Authorization: Bearer <token>`, THE System SHALL từ chối mọi request đến API nội bộ với HTTP 401.
4. WHEN JWT hết hạn, THE Auth_Service SHALL trả về HTTP 401 để client thực hiện đăng nhập lại.
5. THE Auth_Service SHALL kiểm tra quyền tại tầng Backend cho mỗi request; Frontend chỉ ẩn/hiện UI dựa trên role nhận từ token.
6. THE System SHALL KHÔNG ghi email, mật khẩu hoặc JWT vào log hệ thống dưới bất kỳ hình thức nào.

---

### Requirement 2: Phân quyền theo vai trò

**User Story:** Là một User, tôi muốn hệ thống kiểm soát quyền dựa trên vai trò của mình, để mỗi người chỉ thực hiện được các thao tác phù hợp.

#### Acceptance Criteria

1. THE System SHALL gán đúng một Role cho mỗi User khi tài khoản được tạo.
2. WHEN User thực hiện một thao tác, THE System SHALL kiểm tra Role của User trước khi xử lý; nếu không đủ quyền, THE System SHALL trả về HTTP 403.
3. THE System SHALL áp dụng ma trận phân quyền sau:

   | Hành động                                    | BA  | Backend Dev | Frontend Dev | Tester |
   |----------------------------------------------|-----|-------------|--------------|--------|
   | Xem danh sách API_Doc                        | ✅  | ✅          | ✅           | ✅     |
   | Xem chi tiết API_Doc                         | ✅  | ✅          | ✅           | ✅     |
   | Tạo API_Doc                                  | ✅  | ✅          | ❌           | ❌     |
   | Chỉnh sửa API_Doc                            | ✅  | ✅          | ❌           | ❌     |
   | Xóa API_Doc (soft delete)                    | ✅  | ❌          | ❌           | ❌     |
   | Tạo Comment                                  | ✅  | ✅          | ✅           | ✅     |
   | Xem Comment                                  | ✅  | ✅          | ✅           | ✅     |
   | Xóa Comment của chính mình                   | ✅  | ✅          | ✅           | ✅     |
   | Xem danh sách Issue                          | ✅  | ✅          | ✅           | ✅     |
   | Tạo Issue                                    | ✅  | ✅          | ✅           | ✅     |
   | Sửa tiêu đề/mô tả/priority của Issue *       | ✅  | ✅          | ✅           | ✅     |
   | Cập nhật assigned_to của Issue               | ✅  | ✅          | ❌           | ❌     |
   | Chuyển Issue: Open → In Progress             | ✅  | ✅          | ✅           | ✅     |
   | Chuyển Issue: In Progress → Resolved         | ✅  | ✅          | ✅           | ✅     |
   | Chuyển Issue: Resolved → Closed              | ✅  | ❌          | ❌           | ✅     |
   | Chuyển Issue: Resolved → Reopened            | ❌  | ❌          | ❌           | ✅     |
   | Chuyển Issue: Reopened → In Progress         | ✅  | ✅          | ✅           | ✅     |
   | Chuyển Issue: Closed → (bất kỳ)             | ❌  | ❌          | ❌           | ❌     |

   > (*) Chỉ áp dụng với người tạo issue hoặc người được giao xử lý (assigned_to). Xem chi tiết tại Requirement 6.

4. WHERE User có Role `BA`, THE System SHALL cho phép User xóa API_Doc bằng soft delete.
5. WHERE User có Role `Tester`, THE System SHALL cho phép User chuyển Issue_Status từ `Resolved` sang `Reopened`.
6. WHERE User có Role `BA` hoặc `Tester`, THE System SHALL cho phép User chuyển Issue_Status từ `Resolved` sang `Closed`.

---

### Requirement 3: Quản lý tài liệu API

**User Story:** Là một BA hoặc Backend Developer, tôi muốn tạo và quản lý tài liệu API, để các thành viên khác có thể tra cứu và sử dụng.

#### Acceptance Criteria

1. THE System SHALL lưu mỗi API_Doc với các trường bắt buộc: tên, HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), endpoint, mô tả, API_Status; và các trường tùy chọn: request mẫu (JSON text), response mẫu (JSON text).
2. WHEN User có quyền tạo gửi dữ liệu đầy đủ và hợp lệ, THE System SHALL tạo mới một API_Doc và trả về HTTP 201 kèm dữ liệu vừa tạo.
3. IF User gửi dữ liệu thiếu trường bắt buộc, THEN THE System SHALL trả về HTTP 422 kèm danh sách trường bị thiếu hoặc không hợp lệ.
4. WHEN User có quyền chỉnh sửa gửi dữ liệu cập nhật cho một API_Doc tồn tại, THE System SHALL cập nhật và trả về dữ liệu mới nhất.
5. IF User gửi yêu cầu chỉnh sửa một API_Doc không tồn tại hoặc đã bị xóa mềm, THEN THE System SHALL trả về HTTP 404.
6. WHEN User có quyền xóa gửi yêu cầu xóa, THE System SHALL xóa mềm (soft delete) API_Doc bằng cách đặt trường `deleted_at`; API_Doc này sẽ không xuất hiện trong các kết quả tra cứu thông thường.
7. THE System SHALL trả về danh sách API_Doc theo thứ tự `updated_at` giảm dần theo mặc định.
8. THE System SHALL KHÔNG tự động đóng hoặc xóa các Issue liên quan khi một API_Doc bị xóa mềm; các Issue vẫn tồn tại và truy cập được.

---

### Requirement 4: Tìm kiếm và lọc tài liệu API

**User Story:** Là một User, tôi muốn tìm kiếm và lọc danh sách tài liệu API, để nhanh chóng tìm được API cần tra cứu.

#### Acceptance Criteria

1. WHEN User gửi tham số `search` trong query string, THE System SHALL trả về các API_Doc có tên hoặc endpoint chứa chuỗi tìm kiếm (không phân biệt hoa thường).
2. WHEN User gửi tham số `method` trong query string, THE System SHALL lọc và chỉ trả về API_Doc có HTTP method tương ứng.
3. WHEN User gửi tham số `status` trong query string, THE System SHALL lọc và chỉ trả về API_Doc có API_Status tương ứng.
4. THE System SHALL hỗ trợ kết hợp nhiều tham số lọc trong cùng một request.
5. WHEN không có kết quả phù hợp, THE System SHALL trả về HTTP 200 kèm mảng rỗng.

---

### Requirement 5: Bình luận trên tài liệu API và Issue

**User Story:** Là một User, tôi muốn bình luận trên từng API_Doc hoặc Issue, để trao đổi thông tin và làm rõ yêu cầu với đồng đội.

#### Acceptance Criteria

1. THE System SHALL gắn mỗi Comment với đúng một đối tượng cha: hoặc một API_Doc, hoặc một Issue; không cho phép Comment có cả hai hoặc không có đối tượng cha nào.
2. BEFORE lưu Comment, THE System SHALL kiểm tra đối tượng cha (API_Doc hoặc Issue) tồn tại; nếu không tồn tại, THE System SHALL trả về HTTP 404.
3. IF request tạo Comment có cả `api_doc_id` và `issue_id` cùng có giá trị, THEN THE System SHALL trả về HTTP 422.
4. IF request tạo Comment có cả `api_doc_id` và `issue_id` cùng NULL, THEN THE System SHALL trả về HTTP 422.
5. WHEN User gửi nội dung bình luận không rỗng, THE System SHALL lưu Comment với nội dung, `user_id` của người tạo và timestamp tạo.
6. IF User gửi nội dung bình luận rỗng hoặc chỉ chứa khoảng trắng, THEN THE System SHALL trả về HTTP 422.
7. THE System SHALL trả về danh sách Comment của một API_Doc hoặc Issue theo thứ tự `created_at` tăng dần.
8. WHEN User là chủ sở hữu của Comment gửi yêu cầu xóa, THE System SHALL xóa Comment và trả về HTTP 200.
9. IF User không phải chủ sở hữu của Comment gửi yêu cầu xóa, THEN THE System SHALL trả về HTTP 403.

---

### Requirement 6: Quản lý Issue

**User Story:** Là một User, tôi muốn tạo và theo dõi issue liên quan đến một API, để đảm bảo các vấn đề được ghi nhận và xử lý đúng cách.

#### Acceptance Criteria

1. THE System SHALL lưu mỗi Issue với các trường bắt buộc: tiêu đề, mô tả, Priority, `api_doc_id` (liên kết với một API_Doc), `created_by`; và trường tùy chọn: `assigned_to` (User phụ trách).
2. WHEN User tạo Issue mới, THE System SHALL đặt Issue_Status mặc định là `Open`.
3. THE System SHALL áp dụng các chuyển trạng thái hợp lệ sau:

   | Từ trạng thái | Sang trạng thái | Vai trò được phép                    |
   |---------------|-----------------|--------------------------------------|
   | `Open`        | `In Progress`   | BA, Backend Dev, Frontend Dev, Tester |
   | `In Progress` | `Resolved`      | BA, Backend Dev, Frontend Dev, Tester |
   | `Resolved`    | `Closed`        | BA, Tester                           |
   | `Resolved`    | `Reopened`      | Tester                               |
   | `Reopened`    | `In Progress`   | BA, Backend Dev, Frontend Dev, Tester |
   | `Closed`      | *(không đổi)*   | *(không ai)*                         |

4. IF User gửi yêu cầu chuyển trạng thái không hợp lệ (sai luồng hoặc không đủ quyền), THEN THE System SHALL trả về HTTP 422 kèm thông báo nêu rõ lý do.
5. WHEN User muốn cập nhật tiêu đề, mô tả hoặc priority của Issue, THE System SHALL chỉ cho phép nếu User là người tạo (`created_by`) hoặc người được giao xử lý (`assigned_to`) của Issue đó.
6. IF User không phải người tạo và không phải người được giao xử lý cố gắng sửa tiêu đề/mô tả/priority, THEN THE System SHALL trả về HTTP 403.
7. WHEN User muốn cập nhật `assigned_to`, THE System SHALL chỉ cho phép nếu User có Role `BA` hoặc `Backend Developer`; nếu không đủ quyền, THE System SHALL trả về HTTP 403.
8. IF `assigned_to` được cung cấp, THE System SHALL kiểm tra `user_id` đó tồn tại trong bảng `users`; nếu không tồn tại, THE System SHALL trả về HTTP 422.
8. THE System SHALL trả về danh sách Issue theo thứ tự `created_at` giảm dần theo mặc định.
9. WHEN User gửi tham số `status` hoặc `priority` trong query string, THE System SHALL lọc Issue theo giá trị tương ứng; hỗ trợ kết hợp cả hai tham số.
10. THE System SHALL cung cấp endpoint `GET /api/issues` để lấy danh sách tất cả Issue (không giới hạn theo API_Doc), có hỗ trợ lọc theo `status` và `priority`.
11. IF User gửi yêu cầu tạo Issue cho một API_Doc đã bị xóa mềm (`deleted_at IS NOT NULL`), THEN THE System SHALL trả về HTTP 404.

---

### Requirement 7: Cấu trúc dự án và REST API Endpoints

**User Story:** Là một Developer, tôi muốn có cấu trúc thư mục và danh sách endpoint rõ ràng, để triển khai nhất quán và dễ kiểm thử.

#### Acceptance Criteria

1. THE System SHALL tổ chức Backend theo cấu trúc:
   ```
   backend/
   ├── src/
   │   ├── config/        # cấu hình DB, env
   │   ├── middlewares/   # auth, role check, error handler
   │   ├── models/        # Sequelize models
   │   ├── controllers/   # xử lý request/response
   │   ├── routes/        # định nghĩa route
   │   ├── services/      # business logic
   │   └── app.ts
   ├── package.json
   └── tsconfig.json
   ```

2. THE System SHALL tổ chức Frontend theo cấu trúc:
   ```
   frontend/
   ├── src/
   │   ├── api/           # axios instances, API calls
   │   ├── components/    # shared UI components
   │   ├── pages/         # page-level components
   │   ├── hooks/         # custom hooks
   │   ├── store/         # state management (Context hoặc Zustand)
   │   ├── types/         # TypeScript interfaces
   │   └── main.tsx
   ├── package.json
   └── vite.config.ts
   ```

3. THE System SHALL cung cấp các REST API endpoint theo bảng sau:

   | Method | Endpoint                         | Mô tả                                        | Quyền tối thiểu       |
   |--------|----------------------------------|----------------------------------------------|-----------------------|
   | POST   | `/api/auth/login`                | Đăng nhập                                    | Public                |
   | GET    | `/api/auth/me`                   | Lấy thông tin user hiện tại                  | Đã đăng nhập          |
   | GET    | `/api/api-docs`                  | Danh sách API_Doc (có filter)                | Đã đăng nhập          |
   | POST   | `/api/api-docs`                  | Tạo API_Doc mới                              | BA, Backend Dev       |
   | GET    | `/api/api-docs/:id`              | Chi tiết API_Doc                             | Đã đăng nhập          |
   | PUT    | `/api/api-docs/:id`              | Cập nhật API_Doc                             | BA, Backend Dev       |
   | DELETE | `/api/api-docs/:id`              | Xóa API_Doc (soft delete)                    | BA                    |
   | GET    | `/api/api-docs/:id/comments`     | Danh sách Comment của API_Doc                | Đã đăng nhập          |
   | POST   | `/api/api-docs/:id/comments`     | Tạo Comment cho API_Doc                      | Đã đăng nhập          |
   | DELETE | `/api/comments/:commentId`       | Xóa Comment (chỉ chủ sở hữu)                | Chủ Comment           |
   | GET    | `/api/api-docs/:id/issues`       | Danh sách Issue của một API_Doc cụ thể       | Đã đăng nhập          |
   | POST   | `/api/api-docs/:id/issues`       | Tạo Issue cho API_Doc                        | Đã đăng nhập          |
   | GET    | `/api/issues`                    | Danh sách tất cả Issue (lọc status/priority) | Đã đăng nhập          |
   | GET    | `/api/issues/:issueId`           | Chi tiết Issue                               | Đã đăng nhập          |
   | PUT    | `/api/issues/:issueId`           | Cập nhật tiêu đề/mô tả/priority/assigned_to | Người tạo/được giao; assigned_to: BA, Backend Dev |
   | PATCH  | `/api/issues/:issueId/status`    | Chuyển trạng thái Issue                      | Theo ma trận          |
   | GET    | `/api/issues/:issueId/comments`  | Danh sách Comment của Issue                  | Đã đăng nhập          |
   | POST   | `/api/issues/:issueId/comments`  | Tạo Comment cho Issue                        | Đã đăng nhập          |

---

### Requirement 8: Thiết kế cơ sở dữ liệu

**User Story:** Là một Developer, tôi muốn có ERD và schema bảng rõ ràng, để xây dựng database đúng với nghiệp vụ.

#### Acceptance Criteria

1. THE System SHALL sử dụng đúng 4 bảng chính: `users`, `api_docs`, `issues`, `comments`. Không thêm bảng mới trong phạm vi MVP.

2. THE System SHALL định nghĩa bảng `users` với các cột:
   - `id` INT PK AUTO_INCREMENT
   - `name` VARCHAR(100) NOT NULL
   - `email` VARCHAR(150) UNIQUE NOT NULL
   - `password_hash` VARCHAR(255) NOT NULL — lưu mật khẩu đã hash bằng bcrypt, không lưu dạng rõ
   - `role` ENUM('BA','Backend Developer','Frontend Developer','Tester') NOT NULL
   - `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

3. THE System SHALL định nghĩa bảng `api_docs` với các cột:
   - `id` INT PK AUTO_INCREMENT
   - `name` VARCHAR(200) NOT NULL
   - `method` ENUM('GET','POST','PUT','PATCH','DELETE') NOT NULL
   - `endpoint` VARCHAR(500) NOT NULL
   - `description` TEXT NOT NULL
   - `request_sample` TEXT NULL — JSON string, không bắt buộc
   - `response_sample` TEXT NULL — JSON string, không bắt buộc
   - `status` ENUM('Draft','Active','Deprecated') NOT NULL DEFAULT 'Draft'
   - `created_by` INT NOT NULL FK → users.id
   - `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   - `deleted_at` TIMESTAMP NULL DEFAULT NULL — NULL nghĩa là chưa xóa

4. THE System SHALL định nghĩa bảng `issues` với các cột:
   - `id` INT PK AUTO_INCREMENT
   - `api_doc_id` INT NOT NULL FK → api_docs.id — vẫn giữ FK dù api_doc bị soft delete; Issue không bị xóa theo
   - `title` VARCHAR(255) NOT NULL
   - `description` TEXT NOT NULL
   - `priority` ENUM('Low','Medium','High') NOT NULL
   - `status` ENUM('Open','In Progress','Resolved','Closed','Reopened') NOT NULL DEFAULT 'Open'
   - `created_by` INT NOT NULL FK → users.id
   - `assigned_to` INT NULL FK → users.id — NULL nếu chưa giao
   - `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

5. THE System SHALL định nghĩa bảng `comments` với các cột:
   - `id` INT PK AUTO_INCREMENT
   - `content` TEXT NOT NULL
   - `user_id` INT NOT NULL FK → users.id
   - `api_doc_id` INT NULL FK → api_docs.id
   - `issue_id` INT NULL FK → issues.id
   - `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   - Constraint: `CHECK ((api_doc_id IS NOT NULL AND issue_id IS NULL) OR (api_doc_id IS NULL AND issue_id IS NOT NULL))`

6. THE System SHALL tạo các index sau để tối ưu truy vấn:
   - `api_docs(name)`, `api_docs(endpoint)`, `api_docs(deleted_at)`
   - `issues(api_doc_id)`, `issues(status)`, `issues(priority)`, `issues(created_by)`, `issues(assigned_to)`
   - `comments(api_doc_id)`, `comments(issue_id)`, `comments(user_id)`

---

### Requirement 9: Validation đầu vào

**User Story:** Là một Developer, tôi muốn hệ thống validate dữ liệu đầu vào chặt chẽ, để tránh lưu dữ liệu rác và phản hồi lỗi rõ ràng.

#### Acceptance Criteria

1. THE System SHALL chuẩn hóa email khi đăng nhập bằng cách trim và chuyển thành chữ thường trước khi so sánh.
2. THE System SHALL từ chối các trường bắt buộc (tên API_Doc, endpoint, mô tả, tiêu đề Issue, nội dung Comment) nếu sau khi trim chỉ còn chuỗi rỗng, và trả về HTTP 422.
3. THE System SHALL kiểm tra `method` của API_Doc chỉ chấp nhận các giá trị: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`; nếu sai, trả về HTTP 422.
4. THE System SHALL kiểm tra `status` của API_Doc chỉ chấp nhận: `Draft`, `Active`, `Deprecated`; nếu sai, trả về HTTP 422.
5. THE System SHALL kiểm tra `priority` của Issue chỉ chấp nhận: `Low`, `Medium`, `High`; nếu sai, trả về HTTP 422.
6. WHEN `assigned_to` được gửi trong request, THE System SHALL xác nhận `user_id` đó tồn tại trong bảng `users`; nếu không tồn tại, trả về HTTP 422.

---

### Requirement 10: Bảo mật

**User Story:** Là một Developer, tôi muốn hệ thống áp dụng các biện pháp bảo mật cơ bản, để bảo vệ dữ liệu người dùng.

#### Acceptance Criteria

1. THE System SHALL đọc JWT secret từ biến môi trường `JWT_SECRET`; không hardcode secret trong source code.
2. THE System SHALL KHÔNG ghi JWT, mật khẩu, password_hash hoặc bất kỳ thông tin xác thực nào vào log.
3. THE System SHALL cung cấp file `.env.example` liệt kê tất cả biến môi trường cần thiết với giá trị mẫu placeholder, không chứa secret thật.
4. THE System SHALL đảm bảo file `.env` được liệt kê trong `.gitignore` và không được commit vào repository.
5. THE System SHALL hash mật khẩu bằng bcrypt với cost factor tối thiểu là 10 trước khi lưu vào database.
6. THE System SHALL luôn thực hiện xác thực JWT và kiểm tra quyền tại tầng Backend cho mọi endpoint nội bộ, không phụ thuộc vào Frontend.

---

### Requirement 11: Hướng dẫn chạy dự án (README)

**User Story:** Là một Developer hoặc người đánh giá, tôi muốn có hướng dẫn rõ ràng để khởi động dự án từ đầu.

#### Acceptance Criteria

1. THE System SHALL cung cấp file `README.md` ở thư mục gốc với các mục:
   - Yêu cầu môi trường (Node.js version, MySQL version)
   - Cài đặt dependencies cho Backend và Frontend
   - Tạo database MySQL
   - Cấu hình biến môi trường (copy từ `.env.example`)
   - Chạy migration tạo 4 bảng
   - Chạy seed để tạo 4 tài khoản demo (kèm thông tin đăng nhập demo)
   - Khởi động Backend (`npm run dev`)
   - Khởi động Frontend (`npm run dev`)
2. THE System SHALL liệt kê thông tin đăng nhập của 4 tài khoản demo (email + mật khẩu rõ) trong README để người dùng có thể đăng nhập ngay.

---

### Requirement 12: Xử lý lỗi nhất quán

**User Story:** Là một Developer, tôi muốn hệ thống trả về lỗi theo chuẩn nhất quán, để Frontend xử lý và hiển thị thông báo đúng cách.

#### Acceptance Criteria

1. THE System SHALL sử dụng các HTTP status code theo quy ước sau:
   - `401 Unauthorized`: chưa đăng nhập, token thiếu, không hợp lệ hoặc đã hết hạn
   - `403 Forbidden`: đã đăng nhập nhưng không đủ quyền thực hiện thao tác
   - `404 Not Found`: tài nguyên không tồn tại hoặc đã bị xóa mềm
   - `422 Unprocessable Entity`: dữ liệu đầu vào không hợp lệ hoặc chuyển trạng thái Issue không được phép
   - `500 Internal Server Error`: lỗi máy chủ ngoài dự kiến

2. THE System SHALL trả về tất cả response lỗi theo cấu trúc JSON nhất quán:
   ```json
   { "error": "Mô tả lỗi ngắn gọn bằng tiếng Anh hoặc tiếng Việt" }
   ```

3. THE System SHALL KHÔNG để lộ stack trace, thông tin nội bộ hệ thống hoặc thông tin nhạy cảm trong response lỗi trả về client.

4. THE System SHALL xử lý lỗi tập trung qua một error handler middleware duy nhất trong Express.

---

### Requirement 13: Thứ tự triển khai

**User Story:** Là một Developer, tôi muốn có lộ trình triển khai theo độ ưu tiên, để hoàn thành MVP trước deadline.

#### Acceptance Criteria

1. THE System SHALL được triển khai theo thứ tự ưu tiên sau:

   **Giai đoạn 1 – Nền tảng (Ưu tiên cao nhất)**
   - Khởi tạo project Backend (Express + TypeScript + Sequelize + MySQL)
   - Khởi tạo project Frontend (React + TypeScript + Vite)
   - Tạo migration database (4 bảng)
   - Seed 4 tài khoản demo (một mỗi role), mật khẩu hash bằng bcrypt
   - Auth: đăng nhập, trả JWT, middleware xác thực và phân quyền

   **Giai đoạn 2 – Quản lý API_Doc**
   - CRUD API_Doc (Backend + Frontend)
   - Tìm kiếm và lọc

   **Giai đoạn 3 – Issue & Comment**
   - CRUD Issue, chuyển trạng thái theo state machine
   - Comment cho API_Doc và Issue
   - Trang danh sách Issue tổng thể và theo API_Doc (Frontend)

   **Giai đoạn 4 – Hoàn thiện**
   - Kiểm tra lại toàn bộ phân quyền ở Backend
   - Error handler middleware nhất quán
   - Kiểm thử thủ công các luồng chính

---

### Requirement 14: Các giả định nghiệp vụ cho MVP

**User Story:** Là một Developer, tôi muốn các điểm chưa rõ được làm rõ bằng giả định hợp lý, để không bị chặn khi triển khai.

#### Acceptance Criteria

1. THE System SHALL áp dụng các giả định sau nếu không có yêu cầu khác:
   - Không có chức năng đăng ký tài khoản tự do hoặc quản trị người dùng trong MVP; tài khoản được seed sẵn.
   - Không có chức năng quên mật khẩu hoặc đổi mật khẩu trong phạm vi MVP.
   - Không có phân trang (pagination) bắt buộc ở MVP.
   - `request_sample` và `response_sample` lưu dưới dạng plain text (JSON string), không validate cú pháp JSON.
   - Một User có thể vừa là `created_by` vừa là `assigned_to` của cùng một Issue.
   - Xóa mềm API_Doc không ảnh hưởng đến các Issue liên quan; Issue vẫn tồn tại và truy cập được.
   - Không có chức năng thông báo (notification) trong phạm vi MVP.
   - Không có upload file đính kèm trong phạm vi MVP.
   - Seed data bao gồm đúng 4 tài khoản demo: một BA, một Backend Developer, một Frontend Developer, một Tester. Mật khẩu hash bằng bcrypt trước khi insert vào database.

2. IF bất kỳ giả định nào ở trên được xác nhận là sai, THEN THE System SHALL cập nhật requirements trước khi triển khai tính năng liên quan.
