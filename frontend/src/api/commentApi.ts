import api from './axios';
import type { Comment } from '../types';

export const getCommentsByApiDoc = (apiDocId: number) =>
  api.get<Comment[]>(`/api/api-docs/${apiDocId}/comments`);

export const createCommentOnApiDoc = (apiDocId: number, content: string) =>
  api.post<Comment>(`/api/api-docs/${apiDocId}/comments`, { content });

export const getCommentsByIssue = (issueId: number) =>
  api.get<Comment[]>(`/api/issues/${issueId}/comments`);

export const createCommentOnIssue = (issueId: number, content: string) =>
  api.post<Comment>(`/api/issues/${issueId}/comments`, { content });

export const deleteComment = (commentId: number) =>
  api.delete(`/api/comments/${commentId}`);
