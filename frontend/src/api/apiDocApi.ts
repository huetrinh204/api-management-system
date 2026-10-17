import api from './axios';
import type { ApiDoc } from '../types';

export interface ApiDocFilters {
  search?: string;
  method?: string;
  status?: string;
  project_id?: number;
}

export const getApiDocs = (filters?: ApiDocFilters) =>
  api.get<ApiDoc[]>('/api/api-docs', { params: filters });

export const getApiDoc = (id: number) =>
  api.get<ApiDoc>(`/api/api-docs/${id}`);

export const createApiDoc = (data: Partial<ApiDoc>) =>
  api.post<ApiDoc>('/api/api-docs', data);

export const updateApiDoc = (id: number, data: Partial<ApiDoc>) =>
  api.put<ApiDoc>(`/api/api-docs/${id}`, data);

export const deleteApiDoc = (id: number) =>
  api.delete(`/api/api-docs/${id}`);
