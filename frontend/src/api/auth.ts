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
};