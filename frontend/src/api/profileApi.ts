import axios from './axios';
import type { User } from '../types';

export interface UpdateProfileRequest {
  name?: string;
  avatar_url?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export async function getProfile(): Promise<User> {
  const response = await axios.get('/api/profile');
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await axios.put('/api/profile', data);
  return response.data;
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  const response = await axios.post('/api/profile/change-password', data);
  return response.data;
}
