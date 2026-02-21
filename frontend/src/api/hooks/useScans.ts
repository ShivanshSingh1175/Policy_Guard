import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { ScanRun } from '../../types';

// Mock data
const mockScans: ScanRun[] = [
  {
    id: 'scan_1',
    started_at: '2024-02-20T14:30:00Z',
    completed_at: '2024-02-20T14:32:15Z',
    status: 'COMPLETED',
    rules_checked: 15,
    violations_found: 23,
    duration_seconds: 135,
    collections: ['transactions', 'accounts'],
  },
  {
    id: 'scan_2',
    started_at: '2024-02-19T10:15:00Z',
    completed_at: '2024-02-19T10:17:45Z',
    status: 'COMPLETED',
    rules_checked: 15,
    violations_found: 18,
    duration_seconds: 165,
    collections: ['transactions'],
  },
];

export const useScans = () => {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.get<ScanRun[]>('/scans/runs');
      // return data;
      
      return new Promise<ScanRun[]>((resolve) => {
        setTimeout(() => resolve(mockScans), 300);
      });
    },
  });
};

export const useRunScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { collections?: string[]; rule_ids?: string[] }) => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.post<ScanRun>('/scans/run', params);
      // return data;
      
      return new Promise<ScanRun>((resolve) => {
        setTimeout(() => {
          resolve({
            id: `scan_${Date.now()}`,
            started_at: new Date().toISOString(),
            status: 'RUNNING',
            rules_checked: 0,
            violations_found: 0,
            collections: params.collections,
          });
        }, 1000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
