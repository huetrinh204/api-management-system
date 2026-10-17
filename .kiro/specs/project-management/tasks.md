# Tasks: Project Management Feature

## Phase 1: Database Foundation

- [x] 1. Tạo migration cho bảng `projects`
  - [x] 1.1 Tạo file migration `20241218000001-create-projects.js`
  - [x] 1.2 Định nghĩa schema với các cột: id, name, code (UNIQUE), description, color, status, created_by, timestamps, deletedAt
  - [x] 1.3 Thêm foreign key constraint cho `created_by → users.id`
  - [x] 1.4 Thêm indexes: idx_projects_name, idx_projects_code (UNIQUE), idx_projects_status, idx_projects_deleted_at
  - [x] 1.5 Kiểm tra migration syntax trước khi chạy

- [x] 2. Tạo migration thêm `project_id` vào bảng `api_docs`
  - [x] 2.1 Tạo file migration `20241218000002-add-project-id-to-api-docs.js`
  - [x] 2.2 Thêm cột `project_id INT NULL` sau cột `id`
  - [x] 2.3 Thêm foreign key constraint `project_id → projects.id` với ON DELETE SET NULL
  - [x] 2.4 Thêm index `idx_api_docs_project_id`
  - [x] 2.5 Kiểm tra migration syntax trước khi chạy

- [-] 3. Chạy migrations
  - [x] 3.1 Backup database trước khi chạy migration
  - [x] 3.2 Chạy `npx sequelize-cli db:migrate` trong thư mục backend
  - [x] 3.3 Verify schema bằng MySQL Workbench hoặc command line
  - [x] 3.4 Kiểm tra tất cả API docs hiện tại có `project_id = NULL`

- [ ] 4. Tạo Sequelize model `Project`
  - [x] 4.1 Tạo file `backend/src/models/Project.ts`
  - [x] 4.2 Định nghĩa interface `ProjectAttributes` với đầy đủ fields
  - [x] 4.3 Implement model class với paranoid mode (soft delete)
  - [x] 4.4 Export function `initProject(sequelize)`

- [-] 5. Update Sequelize model `ApiDoc`
  - [x] 5.1 Thêm field `project_id: number | null` vào interface `ApiDocAttributes`
  - [x] 5.2 Thêm field vào model definition
  - [x] 5.3 Không thay đổi logic khác

- [-] 6. Update model associations
  - [x] 6.1 Mở file `backend/src/models/index.ts`
  - [x] 6.2 Import model `Project`
  - [x] 6.3 Thêm `initProject(sequelize)` vào danh sách models
  - [x] 6.4 Thêm associations: `Project.belongsTo(User)`, `Project.hasMany(ApiDoc)`, `ApiDoc.belongsTo(Project)`
  - [x] 6.5 Export `Project` model

## Phase 2: Backend API Implementation

- [-] 7. Tạo `projectService.ts`
  - [x] 7.1 Tạo file `backend/src/services/projectService.ts`
  - [x] 7.2 Implement `getProjects(filters)` với filter status, search, eager load creator
  - [x] 7.3 Implement `getProjectById(id)` với eager load creator và count API docs
  - [x] 7.4 Implement `createProject(data, userId)` với validation code unique, normalize code uppercase, assign default color
  - [x] 7.5 Implement `updateProject(id, data)` với validation code unique (nếu thay đổi code)
  - [x] 7.6 Implement `deleteProject(id)` với soft delete + cascade set project_id = NULL cho api_docs
  - [x] 7.7 Implement `getApiDocsByProject(projectId, filters)` reuse logic từ apiDocService
  - [x] 7.8 Thêm helper function `validateColor(color)` để validate HEX format
  - [x] 7.9 Thêm helper function `getRandomColor()` để assign màu mặc định

- [-] 8. Tạo `projectController.ts`
  - [x] 8.1 Tạo file `backend/src/controllers/projectController.ts`
  - [x] 8.2 Implement `listProjects(req, res, next)` lấy query params từ req.query
  - [x] 8.3 Implement `getProject(req, res, next)` lấy id từ req.params
  - [x] 8.4 Implement `createProject(req, res, next)` lấy data từ req.body, userId từ req.user
  - [x] 8.5 Implement `updateProject(req, res, next)`
  - [x] 8.6 Implement `deleteProject(req, res, next)`
  - [x] 8.7 Implement `listApiDocsByProject(req, res, next)`
  - [x] 8.8 Đảm bảo tất cả controllers có error handling với next(err)

- [x] 9. Tạo routes cho Project
  - [x] 9.1 Tạo file `backend/src/routes/projects.ts`
  - [x] 9.2 Import auth middleware và requireRole middleware
  - [x] 9.3 Setup `GET /api/projects` với auth middleware
  - [x] 9.4 Setup `POST /api/projects` với auth + requireRole(['BA', 'Backend Developer'])
  - [x] 9.5 Setup `GET /api/projects/:id` với auth middleware
  - [x] 9.6 Setup `PUT /api/projects/:id` với auth + requireRole(['BA', 'Backend Developer'])
  - [x] 9.7 Setup `DELETE /api/projects/:id` với auth + requireRole(['BA'])
  - [x] 9.8 Setup `GET /api/projects/:id/api-docs` với auth middleware
  - [x] 9.9 Export router

- [ ] 10. Register routes trong app.ts
  - [x] 10.1 Mở file `backend/src/app.ts`
  - [x] 10.2 Import projectRoutes
  - [x] 10.3 Register `app.use('/api/projects', projectRoutes)`
  - [x] 10.4 Đặt trước error handler middleware

- [x] 11. Update `apiDocService.ts` để hỗ trợ Project
  - [x] 11.1 Update `getApiDocs(filters)` để hỗ trợ filter `project_id` và `unassigned`
  - [x] 11.2 Update eager loading để include `Project` model khi cần
  - [x] 11.3 Update `createApiDoc(data, userId)` để chấp nhận `project_id` (optional, validate nếu có)
  - [x] 11.4 Update `updateApiDoc(id, data)` để cho phép cập nhật `project_id` (validate nếu thay đổi)
  - [x] 11.5 Update `getApiDocById(id)` để eager load `Project`

- [ ] 12. Update `apiDocController.ts`
  - [x] 12.1 Không cần thay đổi logic, chỉ đảm bảo pass đúng data từ req.body đến service

## Phase 3: Frontend Foundation

- [-] 13. Tạo API client cho Project
  - [x] 13.1 Tạo file `frontend/src/api/projectApi.ts`
  - [x] 13.2 Import axios instance từ `./axios`
  - [x] 13.3 Implement `getProjects(filters)` với params: status, search
  - [x] 13.4 Implement `getProject(id)`
  - [x] 13.5 Implement `createProject(data)`
  - [x] 13.6 Implement `updateProject(id, data)`
  - [x] 13.7 Implement `deleteProject(id)`
  - [x] 13.8 Implement `getApiDocsByProject(id, filters)`
  - [x] 13.9 Export tất cả functions

- [x] 14. Update TypeScript types
  - [x] 14.1 Mở file `frontend/src/types/index.ts`
  - [x] 14.2 Thêm type `ProjectStatus = 'Active' | 'Archived'`
  - [x] 14.3 Thêm interface `Project` với đầy đủ fields
  - [x] 14.4 Update interface `ApiDoc` thêm fields `project_id: number | null` và `project?: Project`
  - [x] 14.5 Thêm interface `ProjectFilters` với fields status, search

- [-] 15. Tạo ProjectBadge component
  - [x] 15.1 Tạo file `frontend/src/components/ui/ProjectBadge.tsx`
  - [x] 15.2 Props: `project?: Project | null, size?: 'sm' | 'md'`
  - [x] 15.3 Render badge với project.code, background color từ project.color
  - [ ] 15.4 Nếu project null → render badge "Unassigned" với màu xám
  - [x] 15.5 Style responsive với CSS variables
  - [x] 15.6 Export component

- [-] 16. Tạo ProjectSelect component
  - [x] 16.1 Tạo file `frontend/src/components/ProjectSelect.tsx`
  - [x] 16.2 Props: `value: number | null, onChange: (id: number | null) => void, allowUnassigned?: boolean`
  - [x] 16.3 Fetch danh sách projects từ API khi mount
  - [ ] 16.4 Render dropdown với option "None (Unassigned)" nếu allowUnassigned = true
  - [x] 16.5 Group projects theo status: Active trước, Archived sau (optional separator)
  - [x] 16.6 Handle loading và error states
  - [x] 16.7 Export component

- [ ] 17. Tạo ColorPicker component (simple version)
  - [ ] 17.1 Tạo file `frontend/src/components/ColorPicker.tsx`
  - [ ] 17.2 Props: `value: string | null, onChange: (color: string) => void`
  - [ ] 17.3 Define preset colors palette (10 colors)
  - [ ] 17.4 Render grid of color buttons
  - [ ] 17.5 Highlight selected color
  - [ ] 17.6 (Optional) Thêm custom HEX input field
  - [ ] 17.7 Export component

## Phase 4: Frontend Pages

- [-] 18. Tạo ProjectListPage
  - [x] 18.1 Tạo file `frontend/src/pages/ProjectListPage.tsx`
  - [x] 18.2 Setup state: projects, loading, error, filters (status, search)
  - [x] 18.3 Fetch projects từ API khi mount hoặc filters thay đổi
  - [x] 18.4 Render page header với title "Projects" + "New Project" button (chỉ BA/Backend Dev)
  - [x] 18.5 Render filter bar: status dropdown (All/Active/Archived), search input
  - [x] 18.6 Render table với columns: Code (ProjectBadge), Name, Description (truncated), Status, API Docs Count, Created By, Updated
  - [x] 18.7 Render action buttons: View, Edit (BA/Backend Dev), Delete (BA) với confirm dialog
  - [x] 18.8 Handle delete với confirmation dialog
  - [x] 18.9 Render EmptyState nếu không có projects
  - [x] 18.10 Render LoadingSpinner khi đang fetch
  - [x] 18.11 Handle pagination nếu cần (optional cho phase sau)

- [-] 19. Tạo ProjectDetailPage
  - [ ] 19.1 Tạo file `frontend/src/pages/ProjectDetailPage.tsx`
  - [ ] 19.2 Get project id từ useParams
  - [ ] 19.3 Setup state: project, apiDocs, loading
  - [ ] 19.4 Fetch project detail và API docs từ API khi mount
  - [ ] 19.5 Render back link "Back to Projects"
  - [ ] 19.6 Render header: project code + name, status badge, edit/delete buttons (theo quyền)
  - [ ] 19.7 Render metadata card: description, color preview, created by, dates
  - [ ] 19.8 Render section "API Documentation" với count + "New API Doc" button
  - [ ] 19.9 Reuse table từ ApiDocListPage hoặc tạo shared component
  - [ ] 19.10 Render EmptyState nếu project chưa có API docs
  - [ ] 19.11 Handle delete project với confirmation dialog → navigate về /projects

- [ ] 20. Tạo ProjectFormPage
  - [ ] 20.1 Tạo file `frontend/src/pages/ProjectFormPage.tsx`
  - [ ] 20.2 Get project id từ useParams để phân biệt create/edit mode
  - [ ] 20.3 Setup form state: name, code, description, color, status
  - [ ] 20.4 Fetch project data nếu edit mode
  - [ ] 20.5 Render back link "Back to Projects"
  - [ ] 20.6 Render header: "New Project" hoặc "Edit Project"
  - [ ] 20.7 Render form fields: Project Name (required), Project Code (required, uppercase hint), Description (textarea), Color (ColorPicker), Status (dropdown)
  - [ ] 20.8 Handle form submission: validate → call API → navigate về /projects hoặc /projects/:id
  - [ ] 20.9 Handle errors và display error messages
  - [ ] 20.10 Render cancel button → navigate back
  - [ ] 20.11 Disable code field nếu edit mode (không cho thay đổi code sau khi tạo)

- [ ] 21. Update ApiDocListPage với Project filter
  - [x] 21.1 Mở file `frontend/src/pages/ApiDocListPage.tsx`
  - [x] 21.2 Thêm state `projectFilter: number | null | 'unassigned'`
  - [x] 21.3 Fetch danh sách projects cho dropdown
  - [x] 21.4 Thêm ProjectSelect dropdown vào filter bar
  - [x] 21.5 Pass projectFilter vào API call `getApiDocs()`
  - [x] 21.6 Thêm cột "Project" vào table, render ProjectBadge
  - [x] 21.7 Handle filter change → refetch API docs

- [-] 22. Update ApiDocFormPage với Project dropdown
  - [x] 22.1 Mở file `frontend/src/pages/ApiDocFormPage.tsx`
  - [x] 22.2 Thêm field `project_id: number | null` vào form state
  - [x] 22.3 Load project_id từ API doc data nếu edit mode
  - [x] 22.4 Render ProjectSelect component trong form
  - [x] 22.5 Handle project selection → update form state
  - [x] 22.6 Include project_id trong request body khi submit

- [-] 23. Update ApiDocDetailPage với Project badge
  - [x] 23.1 Mở file `frontend/src/pages/ApiDocDetailPage.tsx`
  - [x] 23.2 Eager load `project` trong API call (backend đã support)
  - [x] 23.3 Render ProjectBadge trong metadata section hoặc header
  - [x] 23.4 ProjectBadge có thể click để navigate đến `/projects/:id` (optional)

- [-] 24. Update Sidebar navigation
  - [x] 24.1 Mở file `frontend/src/components/Sidebar.tsx`
  - [x] 24.2 Thêm menu item "Projects" với icon (dùng FolderIcon hoặc tương tự)
  - [x] 24.3 NavLink to="/projects"
  - [x] 24.4 Đặt thứ tự menu: Projects → API Docs → Issues

- [-] 25. Update routing configuration
  - [x] 25.1 Mở file `frontend/src/main.tsx`
  - [x] 25.2 Import ProjectListPage, ProjectDetailPage, ProjectFormPage
  - [x] 25.3 Thêm route: `<Route path="projects" element={<ProjectListPage />} />`
  - [x] 25.4 Thêm route: `<Route path="projects/new" element={<ProjectFormPage />} />`
  - [x] 25.5 Thêm route: `<Route path="projects/:id" element={<ProjectDetailPage />} />`
  - [x] 25.6 Thêm route: `<Route path="projects/:id/edit" element={<ProjectFormPage />} />`

## Phase 5: Testing & Polish

- [ ] 26. Backend Permission Testing
  - [ ] 26.1 Test BA có thể create, edit, delete projects
  - [ ] 26.2 Test Backend Developer có thể create, edit projects (không delete)
  - [ ] 26.3 Test Frontend Developer không thể create/edit/delete (nhận 403)
  - [ ] 26.4 Test Tester không thể create/edit/delete (nhận 403)
  - [ ] 26.5 Test tất cả roles có thể view projects

- [ ] 27. Backend Business Logic Testing
  - [ ] 27.1 Test tạo project với code trùng → nhận 422
  - [ ] 27.2 Test code được normalize uppercase
  - [ ] 27.3 Test color validation (valid HEX vs invalid)
  - [ ] 27.4 Test soft delete project → verify api_docs.project_id = NULL
  - [ ] 27.5 Test filter API docs by project_id
  - [ ] 27.6 Test filter API docs by unassigned=true
  - [ ] 27.7 Test eager load project in API doc detail

- [ ] 28. Frontend UI Testing
  - [ ] 28.1 Test ProjectListPage hiển thị đúng dữ liệu
  - [ ] 28.2 Test ProjectDetailPage hiển thị đúng project info và API docs
  - [ ] 28.3 Test ProjectFormPage validation (tên rỗng, code rỗng, code format)
  - [ ] 28.4 Test delete project confirmation dialog
  - [ ] 28.5 Test ProjectBadge hiển thị màu đúng
  - [ ] 28.6 Test ProjectBadge "Unassigned" cho project_id null
  - [ ] 28.7 Test ProjectSelect dropdown chọn được project
  - [ ] 28.8 Test ApiDocListPage filter by project
  - [ ] 28.9 Test ApiDocFormPage chọn project khi tạo/sửa API doc

- [ ] 29. Responsive Testing
  - [ ] 29.1 Test ProjectListPage trên mobile (≤768px)
  - [ ] 29.2 Test ProjectDetailPage trên tablet (≤1024px)
  - [ ] 29.3 Test ProjectFormPage trên mobile
  - [ ] 29.4 Test sidebar navigation với Projects menu item
  - [ ] 29.5 Test table responsive trên mobile (horizontal scroll hoặc card layout)

- [ ] 30. Backward Compatibility Testing
  - [ ] 30.1 Verify tất cả API docs cũ có project_id = NULL
  - [ ] 30.2 Verify API docs cũ hiển thị badge "Unassigned"
  - [ ] 30.3 Verify filter "Unassigned" hoạt động
  - [ ] 30.4 Verify có thể gán project cho API doc cũ qua Edit form
  - [ ] 30.5 Verify endpoint `GET /api/api-docs` vẫn hoạt động bình thường (không bắt buộc filter)
  - [ ] 30.6 Verify tạo API doc mới không bắt buộc chọn project
  - [ ] 30.7 Verify Issues và Comments của API docs không bị ảnh hưởng

- [ ] 31. Error Handling Testing
  - [ ] 31.1 Test 404 khi access project không tồn tại
  - [ ] 31.2 Test 422 khi validate fail (code trùng, color invalid)
  - [ ] 31.3 Test 403 khi không đủ quyền
  - [ ] 31.4 Test frontend error messages hiển thị rõ ràng
  - [ ] 31.5 Test network error handling (API down)

- [ ] 32. Update Documentation
  - [ ] 32.1 Update README.md với section "Project Management"
  - [ ] 32.2 Thêm hướng dẫn tạo project
  - [ ] 32.3 Thêm hướng dẫn gán API doc vào project
  - [ ] 32.4 Thêm screenshot của Project pages (optional)
  - [ ] 32.5 Document REST API endpoints cho projects
  - [ ] 32.6 Document permissions matrix cho projects

- [ ] 33. Code Quality & Cleanup
  - [ ] 33.1 Chạy TypeScript type check: `npm run type-check` (backend + frontend)
  - [ ] 33.2 Chạy linter: `npm run lint` (nếu có)
  - [ ] 33.3 Remove unused imports và console.logs
  - [ ] 33.4 Format code với Prettier (nếu có)
  - [ ] 33.5 Review code để đảm bảo tuân thủ coding standards hiện tại

- [ ] 34. Final Smoke Test
  - [ ] 34.1 Đăng nhập với 4 roles khác nhau
  - [ ] 34.2 Test toàn bộ flow: Tạo project → Tạo API doc trong project → View project detail → Edit project → Delete project
  - [ ] 34.3 Test flow: Filter API docs by project → Gán API doc cũ vào project
  - [ ] 34.4 Test flow: Archive project → Verify project vẫn hiển thị với status Archived
  - [ ] 34.5 Verify không có breaking changes với chức năng hiện tại (API docs, Issues, Comments)

