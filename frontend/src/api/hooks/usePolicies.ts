import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Policy } from '../../types';

export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const { data } = await apiClient.get<Policy[]>('/policies');
      return data;
    },
  });
};

export const useUploadPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace('.pdf', ''));
      formData.append('description', `Uploaded policy: ${file.name}`);
      formData.append('version', '1.0');

      const { data } = await apiClient.post<Policy>('/policies/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name?: string; description?: string }) => {
      const { data } = await apiClient.patch<Policy>(`/policies/${id}`, { name, description });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

export const useExtractRules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, autoScan = false }: { id: string; autoScan?: boolean }) => {
      const { data } = await apiClient.post(`/policies/${id}/extract-rules?auto_scan=${autoScan}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
};
