// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('threatlens_token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Fetch current user to verify token is valid
    authApi.getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token invalid or expired, remove it
        localStorage.removeItem('threatlens_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (token: string, userData: User) => {
    localStorage.setItem('threatlens_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('threatlens_token');
    setUser(null);
    window.location.href = '/login';
  };

  return { user, isLoading, login, logout };
}