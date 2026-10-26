// src/api/auth.ts
import { apiClient } from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: { email: string; password: string; name?: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }): Promise<{ user: User }> => {
    const response = await apiClient.patch<{ user: User }>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/auth/password', data);
    return response.data;
  },
};