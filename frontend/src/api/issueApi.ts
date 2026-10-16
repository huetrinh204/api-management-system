import api from './axios';
import type { Issue } from '../types';

export interface IssueFilters {
  status?: string;
  priority?: string;
}

export const getIssues = (filters?: IssueFilters) =>
  api.get<Issue[]>('/api/issues', { params: filters });

export const getIssuesByApiDoc = (apiDocId: number, filters?: IssueFilters) =>
  api.get<Issue[]>(`/api/api-docs/${apiDocId}/issues`, { params: filters });

export const getIssue = (id: number) =>
  api.get<Issue>(`/api/issues/${id}`);

export const createIssue = (apiDocId: number, data: Partial<Issue>) =>
  api.post<Issue>(`/api/api-docs/${apiDocId}/issues`, data);

export const updateIssue = (id: number, data: Partial<Issue>) =>
  api.put<Issue>(`/api/issues/${id}`, data);

export const updateIssueStatus = (id: number, status: string) =>
  api.patch<Issue>(`/api/issues/${id}/status`, { status });
