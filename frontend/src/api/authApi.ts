import api from './axios';
import type { AuthResponse, User } from '../types';

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { email, password });

export const getMe = () =>
  api.get<User>('/api/auth/me');
