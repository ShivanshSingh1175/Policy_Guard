import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Violation } from '../../types';

interface ViolationFilters {
  rule_id?: string;
  severity?: string;
  status?: string;
  framework?: string;
  control_id?: string;
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

export const useAddViolationComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ violationId, comment }: { violationId: string; comment: string }) => {
      const { data } = await apiClient.post<Violation>(`/violations/${violationId}/comment`, { comment });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
    },
  });
};

export const useAssignViolation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      violationId, 
      assigned_to_user_id, 
      assigned_to_user_name 
    }: { 
      violationId: string; 
      assigned_to_user_id?: string; 
      assigned_to_user_name?: string;
    }) => {
      const { data } = await apiClient.patch<Violation>(`/violations/${violationId}/assign`, {
        assigned_to_user_id,
        assigned_to_user_name,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
    },
  });
};
