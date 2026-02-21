import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiClient } from '../client';
import type { Policy } from '../../types';

// Mock data
const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'AML Transaction Monitoring Policy',
    description: 'Anti-money laundering transaction monitoring requirements',
    version: '2.1',
    source: 'aml_policy_v2.1.pdf',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'High-Value Transaction Policy',
    description: 'Requirements for transactions exceeding $10,000',
    version: '1.5',
    source: 'high_value_policy.pdf',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z',
  },
];

export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.get<Policy[]>('/policies');
      // return data;
      
      return new Promise<Policy[]>((resolve) => {
        setTimeout(() => resolve(mockPolicies), 300);
      });
    },
  });
};

export const useUploadPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // TODO: Replace with real API call
      // const { data } = await apiClient.post<Policy>('/policies/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      // return data;
      
      return new Promise<Policy>((resolve) => {
        setTimeout(() => {
          resolve({
            id: Date.now().toString(),
            name: file.name,
            source: file.name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }, 1000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};
