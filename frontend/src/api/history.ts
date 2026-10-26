// src/api/history.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Investigation, ThreatIndicator } from '../types';

export interface DashboardStats {
  totalInvestigations: number;
  threatsDetected: number;
  safeInvestigations: number;
  recentInvestigations: (Investigation & { indicator: ThreatIndicator })[];
}

export interface PaginatedHistory {
  items: (Investigation & { indicator: ThreatIndicator })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get<DashboardStats>('/history/stats');
      return res.data;
    },
  });
};

export const useHistoryList = (page: number = 1) => {
  return useQuery({
    queryKey: ['history', page],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedHistory>(`/history?page=${page}&pageSize=15`);
      return res.data;
    },
  });
};