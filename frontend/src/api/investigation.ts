// src/api/investigation.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { InvestigationReport } from '../types';

// --- Pure API Functions ---

const runInvestigation = async (indicator: string): Promise<InvestigationReport> => {
  const response = await apiClient.post<InvestigationReport>('/investigations', { indicator });
  return response.data;
};

const getInvestigation = async (id: string): Promise<InvestigationReport> => {
  const response = await apiClient.get<InvestigationReport>(`/investigations/${id}`);
  return response.data;
};

// --- React Query Hooks ---

/**
 * Hook to trigger a new investigation.
 * Example usage: const { mutate, isPending } = useInvestigate();
 * mutate("8.8.8.8");
 */
export const useInvestigate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runInvestigation,
    onSuccess: (data) => {
      // When an investigation finishes, we save it into the React Query cache
      // so the Report page can instantly load it without fetching again.
      queryClient.setQueryData(['investigation', data.investigation.id], data);
      
      // Also invalidate the history list so it updates with the new search
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
};

/**
 * Hook to fetch a specific report by ID (e.g., from the History page).
 */
export const useGetInvestigation = (id: string) => {
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: () => getInvestigation(id),
    enabled: !!id, // Don't run if id is empty
  });
};