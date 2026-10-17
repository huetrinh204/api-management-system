import api from './axios';
import type { Project } from '../types';

export interface ProjectFilters {
  status?: 'Active' | 'Archived';
  search?: string;
}

export interface CreateProjectData {
  name: string;
  code: string;
  description?: string;
  color?: string;
  status?: 'Active' | 'Archived';
}

export interface UpdateProjectData {
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  status?: 'Active' | 'Archived';
}

export const getProjects = (filters?: ProjectFilters) =>
  api.get<Project[]>('/api/projects', { params: filters });

export const getProject = (id: number) =>
  api.get<Project>(`/api/projects/${id}`);

export const createProject = (data: CreateProjectData) =>
  api.post<Project>('/api/projects', data);

export const updateProject = (id: number, data: UpdateProjectData) =>
  api.put<Project>(`/api/projects/${id}`, data);

export const deleteProject = (id: number) =>
  api.delete(`/api/projects/${id}`);

export const getApiDocsByProject = (id: number, filters?: { search?: string; method?: string; status?: string }) =>
  api.get(`/api/projects/${id}/api-docs`, { params: filters });
