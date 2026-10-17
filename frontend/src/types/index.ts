export type UserRole = 'BA' | 'Backend Developer' | 'Frontend Developer' | 'Tester';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiDocStatus = 'Draft' | 'Active' | 'Deprecated';
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
  apiDocsCount?: number;
}

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
  project_id: number | null;
  creator?: User;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export type IssuePriority = 'Low' | 'Medium' | 'High';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';

export interface Issue {
  id: number;
  api_doc_id: number;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  created_by: number;
  assigned_to: number | null;
  creator?: User;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  api_doc_id: number | null;
  issue_id: number | null;
  author?: User;
  createdAt: string;
  updatedAt: string;
}
