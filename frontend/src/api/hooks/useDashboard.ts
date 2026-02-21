import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { DashboardMetrics } from '../../types';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardMetrics>('/dashboard/summary');
      return data;
    },
  });
};
