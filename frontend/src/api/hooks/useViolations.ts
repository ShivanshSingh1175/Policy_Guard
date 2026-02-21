import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Violation } from '../../types';

interface ViolationFilters {
  rule_id?: string;
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const useViolations = (filters?: ViolationFilters) => {
  return useQuery({
    queryKey: ['violations', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Violation[]>('/violations', { params: filters });
      return data;
    },
  });
};

export const useUpdateViolation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      reviewer_note 
    }: { 
      id: string; 
      status: Violation['status']; 
      reviewer_note?: string;
    }) => {
      const { data } = await apiClient.patch<Violation>(`/violations/${id}`, {
        status,
        reviewer_note,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
