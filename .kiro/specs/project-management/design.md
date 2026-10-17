# Tài liệu Thiết kế: Project Management Feature

## Tổng quan

Tính năng Project Management mở rộng hệ thống API Doc Management hiện có bằng cách thêm khả năng nhóm API Documentation theo dự án. Thiết kế đảm bảo tương thích ngược hoàn toàn với dữ liệu và chức năng hiện tại.

---

## Database Schema Changes

### Bảng mới: `projects`

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NULL,
  color VARCHAR(7) NULL,  -- HEX color code (e.g., "#3B82F6")
  status ENUM('Active', 'Archived') NOT NULL DEFAULT 'Active',
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_projects_name (name),
  UNIQUE INDEX idx_projects_code (code),
  INDEX idx_projects_status (status),
  INDEX idx_projects_deleted_at (deleted_at)
);
```

### Cập nhật bảng: `api_docs`

```sql
ALTER TABLE api_docs 
ADD COLUMN project_id INT NULL AFTER id,
ADD FOREIGN KEY fk_api_docs_project (project_id) 
  REFERENCES projects(id) 
  ON UPDATE CASCADE 
  ON DELETE SET NULL,
ADD INDEX idx_api_docs_project_id (project_id);
```

**Lưu ý quan trọng:**
- `ON DELETE SET NULL`: Khi project bị xóa, `project_id` của API docs tự động chuyển về NULL
- Không cần trigger riêng cho soft delete vì sẽ xử lý trong service layer

---

## Updated ERD

```
users (1) ──< projects (created_by)
           └──< api_docs (created_by)
           
projects (1) ──< api_docs (project_id) [nullable]

api_docs (1) ──< issues (api_doc_id)

users (1) ──< issues (created_by, assigned_to)

api_docs (1) ──< comments (api_doc_id)
issues (1) ──< comments (issue_id)
users (1) ──< comments (user_id)
```

---

## Sequelize Model: Project

```typescript
// backend/src/models/Project.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

interface ProjectAttributes {
  id: number;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  status: 'Active' | 'Archived';
  created_by: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string | null;
  public color!: string | null;
  public status!: 'Active' | 'Archived';
  public created_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

export function initProject(sequelize: Sequelize) {
  Project.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
      color: { type: DataTypes.STRING(7), allowNull: true, defaultValue: null },
      status: {
        type: DataTypes.ENUM('Active', 'Archived'),
        allowNull: false,
        defaultValue: 'Active',
      },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: 'projects',
      timestamps: true,
      paranoid: true,
    }
  );
  return Project;
}

export default Project;
```

---

## Model Associations Update

```typescript
// backend/src/models/index.ts - thêm associations
export function setupAssociations() {
  // ... existing associations

  // Project associations
  Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Project.hasMany(ApiDoc, { foreignKey: 'project_id', as: 'apiDocs' });
  
  // ApiDoc associations (update)
  ApiDoc.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
  // ... keep existing associations
}
```

---

## Backend Service Layer

### projectService.ts

```typescript
// Các function chính:
- getProjects(filters): Lấy danh sách projects với filter
- getProjectById(id): Lấy chi tiết project + eager load creator
- createProject(data, userId): Tạo project mới, validate code unique
- updateProject(id, data): Cập nhật project, validate code unique (nếu thay đổi)
- deleteProject(id): Soft delete project + set project_id = NULL cho api_docs
- getApiDocsByProject(projectId, filters): Lấy API docs của project
```

**Business Logic quan trọng:**

1. **Code normalization:**
   ```typescript
   const normalizedCode = data.code.trim().toUpperCase();
   ```

2. **Color assignment:**
   ```typescript
   const DEFAULT_COLORS = [
     '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
     '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
   ];
   
   if (!data.color) {
     data.color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
   }
   ```

3. **Soft delete cascade:**
   ```typescript
   async deleteProject(id: number) {
     const project = await Project.findByPk(id);
     if (!project) throw new NotFoundError();
     
     // Set project_id = NULL cho tất cả API docs của project này
     await ApiDoc.update(
       { project_id: null },
       { where: { project_id: id } }
     );
     
     // Soft delete project
     await project.destroy();
   }
   ```

---

## API Endpoints

### Projects

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/api-docs
```

### Updated API Docs Endpoints

```
GET /api/api-docs
  Query params:
    - search (existing)
    - method (existing)
    - status (existing)
    - project_id (NEW) - filter by project ID
    - unassigned (NEW) - boolean, show only unassigned docs

GET /api/api-docs/:id
  Response includes: { ...doc, project: { id, name, code, color } }

POST /api/api-docs
  Request body includes: { ...fields, project_id?: number | null }

PUT /api/api-docs/:id
  Request body includes: { ...fields, project_id?: number | null }
```

---

## Frontend TypeScript Interfaces

```typescript
// frontend/src/types/index.ts

export type ProjectStatus = 'Active' | 'Archived';

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  status: ProjectStatus;
  created_by: number;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

// Update ApiDoc interface
export interface ApiDoc {
  id: number;
  name: string;
  method: HttpMethod;
  endpoint: string;
  description: string;
  request_sample: string | null;
  response_sample: string | null;
  status: ApiDocStatus;
  created_by: number;
  project_id: number | null;  // NEW
  creator?: User;
  project?: Project;           // NEW - eager loaded
  createdAt: string;
  updatedAt: string;
}
```

---

## Frontend Components

### New Reusable Components

1. **ProjectBadge.tsx**
   - Props: `project?: Project | null, size?: 'sm' | 'md'`
   - Hiển thị project code với màu nền tương ứng
   - Nếu project = null → hiển thị badge xám "Unassigned"

2. **ProjectSelect.tsx**
   - Props: `value: number | null, onChange: (id: number | null) => void, allowUnassigned?: boolean`
   - Dropdown danh sách projects + option "None (Unassigned)"
   - Group by status: Active projects trước, Archived sau

3. **ColorPicker.tsx** (optional, simple version)
   - Props: `value: string | null, onChange: (color: string) => void`
   - Grid 10 màu preset + option custom HEX input
   - Default: random color from palette

---

## Frontend Pages Structure

### ProjectListPage.tsx

```
Layout:
- Page Header (title + "New Project" button)
- Filter Bar (status dropdown, search input)
- Table:
  Columns: Code (badge), Name, Description (truncated), Status, API Docs Count, Created By, Updated
  Actions: View, Edit (BA/Backend Dev), Delete (BA)
- Empty State (if no projects)
```

### ProjectDetailPage.tsx

```
Layout:
- Back link
- Header (code + name, status badge, edit/delete buttons)
- Metadata Card (description, color preview, created by, dates)
- API Documentation Section:
  - Sub-header: "API Documentation" + count + "New API Doc" button
  - Reuse ApiDocList component (filtered by project_id)
  - Empty state: "No API docs in this project yet"
```

### ProjectFormPage.tsx

```
Layout:
- Back link
- Header (Create/Edit Project)
- Form Card:
  Fields:
    - Project Name (required, text input)
    - Project Code (required, text input, uppercase hint)
    - Description (optional, textarea)
    - Color (optional, color picker component)
    - Status (dropdown: Active/Archived)
  Actions: Cancel, Save
```

---

## Frontend Routing

```typescript
// frontend/src/main.tsx - thêm routes
<Route path="projects" element={<ProjectListPage />} />
<Route path="projects/new" element={<ProjectFormPage />} />
<Route path="projects/:id" element={<ProjectDetailPage />} />
<Route path="projects/:id/edit" element={<ProjectFormPage />} />
```

---

## UI/UX Considerations

### Project Badge Design

```css
.project-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  background-color: var(--project-color);
  color: white;
}

.project-badge.unassigned {
  background-color: var(--surface-3);
  color: var(--text-tertiary);
}
```

### Color Palette (Default)

```typescript
const PROJECT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Indigo', value: '#6366F1' },
];
```

---

## Migration Strategy

### Migration 1: Create projects table

```javascript
// backend/migrations/20241218000001-create-projects.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      // ... full schema
    });
    // Add indexes
  },
  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  }
};
```

### Migration 2: Add project_id to api_docs

```javascript
// backend/migrations/20241218000002-add-project-id-to-api-docs.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('api_docs', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: 'projects', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    
    await queryInterface.addIndex('api_docs', ['project_id'], {
      name: 'idx_api_docs_project_id'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('api_docs', 'idx_api_docs_project_id');
    await queryInterface.removeColumn('api_docs', 'project_id');
  }
};
```

**Lưu ý:** Migration 2 không ảnh hưởng đến dữ liệu hiện tại vì `project_id` mặc định là NULL.

---

## Testing Checklist

### Backend Tests

- [ ] Create project with valid data
- [ ] Create project with duplicate code (should fail)
- [ ] Create project without permission (should fail 403)
- [ ] Update project code uniqueness validation
- [ ] Soft delete project → verify API docs set to NULL
- [ ] Filter API docs by project_id
- [ ] Filter API docs by unassigned=true
- [ ] Eager load project in API doc detail

### Frontend Tests

- [ ] Project list page displays correctly
- [ ] Create project form validation
- [ ] Edit project form pre-fills data
- [ ] Delete project confirmation dialog
- [ ] API doc list filter by project
- [ ] API doc form project dropdown
- [ ] Project badge displays color correctly
- [ ] Unassigned badge displays for null project_id
- [ ] Mobile responsive layout

### Permission Tests

- [ ] BA can create, edit, delete projects
- [ ] Backend Dev can create, edit projects (not delete)
- [ ] Frontend Dev cannot create/edit/delete projects
- [ ] Tester cannot create/edit/delete projects
- [ ] All roles can view projects

---

## Rollback Plan

Nếu cần rollback tính năng:

1. **Rollback Migration 2:**
   ```bash
   npx sequelize-cli db:migrate:undo --name 20241218000002-add-project-id-to-api-docs.js
   ```
   → Xóa cột `project_id` khỏi `api_docs` (dữ liệu API docs không bị ảnh hưởng)

2. **Rollback Migration 1:**
   ```bash
   npx sequelize-cli db:migrate:undo --name 20241218000001-create-projects.js
   ```
   → Xóa bảng `projects`

3. **Frontend rollback:**
   - Xóa routes `/projects`
   - Xóa menu item "Projects" trong sidebar
   - Revert changes trong `ApiDocListPage` và `ApiDocFormPage`

---

## Performance Considerations

1. **Eager Loading:**
   - Sử dụng `include: [{ model: Project, as: 'project' }]` khi cần
   - Không eager load mặc định cho danh sách lớn

2. **Indexes:**
   - `idx_api_docs_project_id` giúp filter nhanh
   - `idx_projects_code` unique index giúp validate nhanh

3. **Caching (future):**
   - Cache project list trong frontend context
   - Invalidate khi có create/update/delete project

---

## Security Notes

1. **Authorization:**
   - Kiểm tra quyền tại tầng Backend cho mọi operation
   - Frontend chỉ ẩn/hiện UI dựa trên role

2. **Input Validation:**
   - Trim và normalize `code` trước khi lưu
   - Validate HEX color format
   - Check unique constraint trước khi insert

3. **SQL Injection:**
   - Sequelize tự động escape parameters
   - Không dùng raw queries với user input

