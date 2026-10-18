import axios from './axios';
import type { User } from '../types';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'BA' | 'Backend Developer' | 'Frontend Developer' | 'Tester';
}

export interface CreateUserResponse {
  user: User;
  temporaryPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ListUsersParams {
  role?: string;
  is_active?: boolean;
  search?: string;
}

export async function listUsers(params?: ListUsersParams): Promise<User[]> {
  const response = await axios.get('/api/users', { params });
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await axios.get(`/api/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const response = await axios.post('/api/users', data);
  return response.data;
}

export async function updateUser(id: number, data: UpdateUserRequest): Promise<User> {
  const response = await axios.put(`/api/users/${id}`, data);
  return response.data;
}

export async function toggleUserStatus(id: number): Promise<User> {
  const response = await axios.patch(`/api/users/${id}/status`);
  return response.data;
}
