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
