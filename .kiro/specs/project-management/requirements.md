# Tài liệu Yêu cầu: Project Management Feature

## Giới thiệu

Tính năng Project Management cho phép tổ chức và nhóm các API Documentation theo dự án, giúp quản lý tài liệu API một cách có cấu trúc hơn. Tính năng này được xây dựng trên hệ thống API Doc Management hiện có, đảm bảo tương thích ngược với dữ liệu cũ.

---

## Bảng thuật ngữ (Glossary)

- **Project**: Một đơn vị tổ chức nhóm nhiều API_Doc liên quan. Mỗi Project có tên, mã code, mô tả và trạng thái.
- **Project_Code**: Mã định danh ngắn gọn cho Project (ví dụ: "AUTH", "PAYMENT"), dùng để hiển thị trong UI.
- **Project_Status**: Trạng thái của Project. Gồm 2 giá trị: `Active`, `Archived`.
- **Unassigned API_Doc**: API_Doc có `project_id = NULL`, chưa được gán vào bất kỳ Project nào.
- **Project_Color**: Mã màu HEX đơn giản để phân biệt các Project trên giao diện (ví dụ: "#3B82F6", "#10B981").

---

## Yêu cầu (Requirements)

---

### Requirement 1: Quản lý Project

**User Story:** Là một BA hoặc Backend Developer, tôi muốn tạo và quản lý Projects, để nhóm các API documentation theo dự án một cách có tổ chức.

#### Acceptance Criteria

1. THE System SHALL lưu mỗi Project với các trường bắt buộc: name, code, status, created_by; và trường tùy chọn: description, color.
2. WHEN User có quyền tạo (BA hoặc Backend Developer) gửi dữ liệu đầy đủ và hợp lệ, THE System SHALL tạo mới một Project và trả về HTTP 201 kèm dữ liệu vừa tạo.
3. IF User gửi dữ liệu thiếu trường bắt buộc, THEN THE System SHALL trả về HTTP 422 kèm danh sách trường bị thiếu hoặc không hợp lệ.
4. THE System SHALL kiểm tra `code` của Project phải là duy nhất (UNIQUE) trong toàn hệ thống; nếu trùng, trả về HTTP 422.
5. THE System SHALL chuẩn hóa `code` bằng cách trim và chuyển thành chữ IN HOA trước khi lưu.
6. THE System SHALL kiểm tra `color` (nếu được cung cấp) phải là mã HEX hợp lệ (ví dụ: "#3B82F6"); nếu không hợp lệ, trả về HTTP 422.
7. WHEN User có quyền chỉnh sửa gửi dữ liệu cập nhật cho một Project tồn tại, THE System SHALL cập nhật và trả về dữ liệu mới nhất.
8. IF User gửi yêu cầu chỉnh sửa một Project không tồn tại hoặc đã bị xóa mềm, THEN THE System SHALL trả về HTTP 404.
9. WHEN User có quyền xóa (BA) gửi yêu cầu xóa Project, THE System SHALL xóa mềm (soft delete) Project bằng cách đặt trường `deleted_at`.
10. WHEN một Project bị xóa mềm, THE System SHALL tự động cập nhật `project_id = NULL` cho tất cả API_Doc thuộc Project đó.
11. THE System SHALL trả về danh sách Project theo thứ tự `updated_at` giảm dần theo mặc định.
12. THE System SHALL KHÔNG cho phép xóa hoàn toàn (hard delete) Project trong phạm vi tính năng này.

---

### Requirement 2: Phân quyền Project

**User Story:** Là một User, tôi muốn hệ thống kiểm soát quyền trên Project dựa trên vai trò của mình.

#### Acceptance Criteria

1. THE System SHALL áp dụng ma trận phân quyền sau cho Project:

   | Hành động                     | BA  | Backend Dev | Frontend Dev | Tester |
   |-------------------------------|-----|-------------|--------------|--------|
   | Xem danh sách Project         | ✅  | ✅          | ✅           | ✅     |
   | Xem chi tiết Project          | ✅  | ✅          | ✅           | ✅     |
   | Tạo Project                   | ✅  | ✅          | ❌           | ❌     |
   | Chỉnh sửa Project             | ✅  | ✅          | ❌           | ❌     |
   | Xóa Project (soft delete)     | ✅  | ❌          | ❌           | ❌     |
   | Archive/Restore Project       | ✅  | ✅          | ❌           | ❌     |

2. THE System SHALL kiểm tra quyền tại tầng Backend cho mọi request liên quan đến Project; nếu không đủ quyền, trả về HTTP 403.
3. THE System SHALL cho phép tất cả role xem danh sách và chi tiết Project, bao gồm cả Archived Projects.

---

### Requirement 3: Gán API_Doc vào Project

**User Story:** Là một BA hoặc Backend Developer, tôi muốn gán API Documentation vào Project, để tổ chức tài liệu theo dự án.

#### Acceptance Criteria

1. THE System SHALL thêm trường `project_id` vào bảng `api_docs` với kiểu INT NULL.
2. WHEN `project_id` là NULL, THE System SHALL hiển thị API_Doc đó trong nhóm "Chưa phân loại" (Unassigned) trên giao diện.
3. WHEN User có quyền tạo API_Doc (BA hoặc Backend Developer) tạo API_Doc mới, THE System SHALL cho phép chọn Project (optional).
4. WHEN User có quyền chỉnh sửa API_Doc cập nhật API_Doc, THE System SHALL cho phép thay đổi `project_id` (bao gồm set về NULL).
5. IF User gửi `project_id` không tồn tại hoặc đã bị xóa mềm, THEN THE System SHALL trả về HTTP 422.
6. THE System SHALL đảm bảo một API_Doc chỉ thuộc về tối đa một Project tại một thời điểm.
7. WHEN một Project bị xóa mềm, THE System SHALL tự động set `project_id = NULL` cho tất cả API_Doc của Project đó.
8. THE System SHALL KHÔNG xóa API_Doc khi Project bị xóa; API_Doc chỉ trở về trạng thái "Unassigned".

---

### Requirement 4: Tìm kiếm và lọc theo Project

**User Story:** Là một User, tôi muốn lọc danh sách API Documentation theo Project, để dễ dàng tìm các API thuộc dự án cụ thể.

#### Acceptance Criteria

1. THE System SHALL hỗ trợ filter `?project_id=<id>` trong endpoint `GET /api/api-docs` để lọc API_Doc theo Project.
2. THE System SHALL hỗ trợ filter `?project_id=null` hoặc `?unassigned=true` để lọc các API_Doc chưa được gán vào Project nào.
3. THE System SHALL cho phép kết hợp filter `project_id` với các filter hiện có (search, method, status).
4. THE System SHALL trả về endpoint mới `GET /api/projects/:id/api-docs` để lấy danh sách API_Doc của một Project cụ thể.
5. WHEN không có kết quả phù hợp, THE System SHALL trả về HTTP 200 kèm mảng rỗng.

---

### Requirement 5: REST API Endpoints cho Project

**User Story:** Là một Developer, tôi muốn có danh sách endpoint rõ ràng cho Project, để triển khai nhất quán.

#### Acceptance Criteria

1. THE System SHALL cung cấp các REST API endpoint mới sau:

   | Method | Endpoint                     | Mô tả                               | Quyền tối thiểu       |
   |--------|------------------------------|-------------------------------------|-----------------------|
   | GET    | `/api/projects`              | Danh sách projects (có filter)      | Đã đăng nhập          |
   | POST   | `/api/projects`              | Tạo project mới                     | BA, Backend Dev       |
   | GET    | `/api/projects/:id`          | Chi tiết project                    | Đã đăng nhập          |
   | PUT    | `/api/projects/:id`          | Cập nhật project                    | BA, Backend Dev       |
   | DELETE | `/api/projects/:id`          | Xóa project (soft delete)           | BA                    |
   | GET    | `/api/projects/:id/api-docs` | Danh sách API docs của project      | Đã đăng nhập          |

2. THE System SHALL cập nhật các endpoint hiện tại:

   | Method | Endpoint           | Thay đổi                                              |
   |--------|--------------------|-------------------------------------------------------|
   | GET    | `/api/api-docs`    | Thêm filter `?project_id=<id>` hoặc `?unassigned=true` |
   | POST   | `/api/api-docs`    | Thêm field `project_id` (optional) trong request body |
   | PUT    | `/api/api-docs/:id`| Cho phép cập nhật `project_id` trong request body    |
   | GET    | `/api/api-docs/:id`| Include thông tin `project` trong response (eager load)|

---

### Requirement 6: Database Schema cho Project

**User Story:** Là một Developer, tôi muốn có schema rõ ràng cho Project, để triển khai đúng cấu trúc.

#### Acceptance Criteria

1. THE System SHALL định nghĩa bảng `projects` với các cột:
   - `id` INT PK AUTO_INCREMENT
   - `name` VARCHAR(200) NOT NULL
   - `code` VARCHAR(50) UNIQUE NOT NULL
   - `description` TEXT NULL
   - `color` VARCHAR(7) NULL — Mã màu HEX (ví dụ: "#3B82F6")
   - `status` ENUM('Active','Archived') NOT NULL DEFAULT 'Active'
   - `created_by` INT NOT NULL FK → users.id
   - `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   - `deleted_at` TIMESTAMP NULL DEFAULT NULL

2. THE System SHALL cập nhật bảng `api_docs` bằng cách thêm cột:
   - `project_id` INT NULL FK → projects.id
   - Thêm index: `idx_api_docs_project_id`

3. THE System SHALL tạo các index sau cho bảng `projects`:
   - `idx_projects_name`
   - `idx_projects_code` (UNIQUE)
   - `idx_projects_status`
   - `idx_projects_deleted_at`

4. THE System SHALL thiết lập foreign key constraint:
   - `api_docs.project_id` REFERENCES `projects.id`
   - `ON UPDATE CASCADE`
   - `ON DELETE SET NULL` — Khi project bị xóa mềm, API docs trở về unassigned

---

### Requirement 7: Validation đầu vào cho Project

**User Story:** Là một Developer, tôi muốn hệ thống validate dữ liệu Project chặt chẽ.

#### Acceptance Criteria

1. THE System SHALL từ chối `name` của Project nếu sau khi trim chỉ còn chuỗi rỗng, và trả về HTTP 422.
2. THE System SHALL từ chối `code` của Project nếu sau khi trim chỉ còn chuỗi rỗng, và trả về HTTP 422.
3. THE System SHALL chuẩn hóa `code` bằng cách trim và chuyển thành chữ IN HOA trước khi validate và lưu.
4. THE System SHALL kiểm tra `code` không được trùng với bất kỳ Project nào khác (kể cả đã xóa mềm); nếu trùng, trả về HTTP 422.
5. THE System SHALL kiểm tra độ dài `code` trong khoảng 2-50 ký tự; nếu sai, trả về HTTP 422.
6. THE System SHALL kiểm tra `status` chỉ chấp nhận: `Active`, `Archived`; nếu sai, trả về HTTP 422.
7. IF `color` được cung cấp, THE System SHALL kiểm tra format HEX hợp lệ (regex: `^#[0-9A-Fa-f]{6}$`); nếu không hợp lệ, trả về HTTP 422.
8. IF `color` không được cung cấp, THE System SHALL tự động gán một màu mặc định ngẫu nhiên từ palette có sẵn.

---

### Requirement 8: Giao diện Frontend cho Project

**User Story:** Là một User, tôi muốn có giao diện quản lý Project trực quan và dễ sử dụng.

#### Acceptance Criteria

1. THE System SHALL cung cấp trang "Project List" hiển thị:
   - Table với các cột: Code, Name, Description (truncated), Status, API Docs Count, Created By, Updated
   - Filter: Status (All/Active/Archived), Search by name or code
   - Actions: View (tất cả), Edit (BA/Backend Dev), Delete (BA)
   - Button "New Project" (chỉ hiện với BA/Backend Dev)

2. THE System SHALL cung cấp trang "Project Detail" hiển thị:
   - Header: Project code + name, status badge, edit/delete buttons
   - Metadata: Description, color preview, created by, dates
   - Section "API Documentation": List các API docs của project (reuse ApiDocList component)
   - Button "New API Doc" để tạo API doc mới trong project này

3. THE System SHALL cung cấp trang "Project Form" (Create/Edit) với các field:
   - Project Name (required)
   - Project Code (required, uppercase hint)
   - Description (optional, textarea)
   - Color (optional, color picker hoặc preset palette)
   - Status (dropdown: Active/Archived)

4. THE System SHALL cập nhật trang "API Doc List" với:
   - Dropdown filter "Project" với danh sách projects + option "Unassigned"
   - Badge màu hiển thị Project code trong mỗi row (hoặc "—" nếu unassigned)

5. THE System SHALL cập nhật trang "API Doc Form" (Create/Edit) với:
   - Dropdown "Project" để chọn project (optional)
   - Option "None (Unassigned)" trong dropdown

6. THE System SHALL thêm menu item "Projects" vào Sidebar navigation.

---

### Requirement 9: Xử lý backward compatibility

**User Story:** Là một Developer, tôi muốn đảm bảo dữ liệu API_Doc cũ không bị ảnh hưởng khi thêm tính năng Project.

#### Acceptance Criteria

1. AFTER migration thêm `project_id` vào `api_docs`, THE System SHALL đảm bảo tất cả API_Doc cũ có `project_id = NULL`.
2. THE System SHALL hiển thị API_Doc có `project_id = NULL` với badge "Chưa phân loại" hoặc "Unassigned" trên giao diện.
3. THE System SHALL cho phép filter "Unassigned" trong dropdown Project để xem các API_Doc chưa gán project.
4. THE System SHALL cho phép BA/Backend Developer gán project cho API_Doc cũ thông qua form Edit API Doc.
5. THE System SHALL KHÔNG bắt buộc chọn Project khi tạo API_Doc mới (để tương thích với workflow hiện tại).
6. THE System SHALL đảm bảo tất cả endpoint hiện tại (`GET /api/api-docs`, `GET /api/api-docs/:id`) vẫn hoạt động bình thường mà không cần filter `project_id`.

---

### Requirement 10: Xử lý khi xóa Project

**User Story:** Là một BA, tôi muốn hiểu rõ điều gì xảy ra khi xóa một Project.

#### Acceptance Criteria

1. WHEN BA xóa một Project, THE System SHALL thực hiện soft delete (set `deleted_at`).
2. AFTER soft delete Project, THE System SHALL tự động cập nhật `UPDATE api_docs SET project_id = NULL WHERE project_id = <deleted_project_id>`.
3. THE System SHALL KHÔNG xóa hoặc ảnh hưởng đến API_Doc, Issue, Comment khi Project bị xóa.
4. THE System SHALL hiển thị thông báo cảnh báo trước khi xóa Project: "API docs trong project này sẽ được chuyển về trạng thái Unassigned. Bạn có chắc chắn muốn xóa?"
5. THE System SHALL KHÔNG hiển thị Project đã xóa mềm trong dropdown filter hoặc danh sách projects (trừ khi có filter đặc biệt).

---

### Requirement 11: Thứ tự triển khai Project Management

**User Story:** Là một Developer, tôi muốn có lộ trình triển khai rõ ràng.

#### Acceptance Criteria

1. THE System SHALL được triển khai theo thứ tự ưu tiên sau:

   **Phase 1 – Database Foundation**
   - Tạo migration cho bảng `projects`
   - Tạo migration thêm `project_id` vào bảng `api_docs`
   - Tạo Sequelize model `Project` với paranoid mode
   - Update model `ApiDoc` với association `belongsTo(Project)`

   **Phase 2 – Backend API**
   - Tạo `projectService.ts` (CRUD, validation, business logic)
   - Tạo `projectController.ts`
   - Tạo `routes/projects.ts` với middleware phân quyền
   - Update `apiDocService.ts` để hỗ trợ filter và eager load Project
   - Update `apiDocController.ts` để xử lý `project_id`

   **Phase 3 – Frontend Foundation**
   - Tạo `projectApi.ts` (API client)
   - Update `types/index.ts` với `Project`, `ProjectStatus`
   - Tạo reusable components: `ProjectBadge`, `ProjectSelect`, `ColorPicker`

   **Phase 4 – Frontend Pages**
   - Tạo `ProjectListPage.tsx`
   - Tạo `ProjectDetailPage.tsx`
   - Tạo `ProjectFormPage.tsx`
   - Update `ApiDocListPage.tsx` với project filter
   - Update `ApiDocFormPage.tsx` với project dropdown
   - Update `ApiDocDetailPage.tsx` với project badge
   - Update routing và sidebar navigation

   **Phase 5 – Testing & Polish**
   - Test permissions cho tất cả endpoints
   - Test UI trên mobile/tablet/desktop
   - Test backward compatibility với API docs cũ
   - Test cascade behavior khi xóa project
   - Update README với tính năng mới

---

### Requirement 12: Các giả định nghiệp vụ cho Project Management

**User Story:** Là một Developer, tôi muốn các điểm chưa rõ được làm rõ bằng giả định hợp lý.

#### Acceptance Criteria

1. THE System SHALL áp dụng các giả định sau:
   - Không có chức năng quản lý thành viên của Project (team members) trong phạm vi tính năng này.
   - Không có chức năng phân quyền riêng theo từng Project (tất cả BA/Backend Dev có quyền như nhau).
   - Không có chức năng archive tự động dựa trên ngày tháng.
   - `color` mặc định được chọn ngẫu nhiên từ palette gồm 10 màu có sẵn.
   - Một API_Doc chỉ thuộc về một Project tại một thời điểm (không hỗ trợ multi-project assignment).
   - Project code không thể thay đổi sau khi tạo (để tránh breaking changes trong references).
   - Không có chức năng merge hoặc duplicate Project trong phạm vi tính năng này.

2. IF bất kỳ giả định nào ở trên được xác nhận là sai, THEN THE System SHALL cập nhật requirements trước khi triển khai tính năng liên quan.

