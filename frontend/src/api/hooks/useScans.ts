import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { ScanRun } from '../../types';

export const useScans = () => {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const { data } = await apiClient.get<ScanRun[]>('/scans/runs');
      return data;
    },
  });
};

export const useRunScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { collections?: string[]; rule_ids?: string[] }) => {
      const { data } = await apiClient.post<ScanRun>('/scans/run', params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
