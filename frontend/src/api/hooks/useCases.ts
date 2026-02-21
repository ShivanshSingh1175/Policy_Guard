import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Case } from '../../types';

export function useCases(filters?: { status?: string; severity?: string }) {
  return useQuery<Case[]>({
    queryKey: ['cases', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.severity) params.append('severity', filters.severity);
      const response = await apiClient.get(`/cases?${params.toString()}`);
      return response.data;
    },
  });
}

export function useCase(id: string | null) {
  return useQuery<Case>({
    queryKey: ['cases', id],
    queryFn: async () => {
      const response = await apiClient.get(`/cases/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; primary_account_id?: string; severity: string; violation_ids: string[] }) => {
      const response = await apiClient.post('/cases', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; title?: string; severity?: string }) => {
      const response = await apiClient.patch(`/cases/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases', data.id] });
    },
  });
}

export function useAddCaseComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const response = await apiClient.post(`/cases/${id}/comment`, { comment });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases', data.id] });
    },
  });
}
