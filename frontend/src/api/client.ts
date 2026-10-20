// src/api/client.ts
import axios from 'axios';

// Create the base axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('threatlens_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token is expired or invalid, clear it and kick user to login
      localStorage.removeItem('threatlens_token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);