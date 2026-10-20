// src/api/history.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Investigation } from '../types';

export interface DashboardStats {
  totalInvestigations: number;
  threatsDetected: number;
  safeInvestigations: number;
  recentInvestigations: (Investigation & {
    indicator: {
      id: string;
      type: string;
      normalizedValue: string;
      originalValue: string;
    };
  })[];
}

const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/history/stats');
  return response.data;
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });
};