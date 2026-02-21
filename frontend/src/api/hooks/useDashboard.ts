import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { DashboardMetrics } from '../../types';

// Mock data for development
const mockDashboardData: DashboardMetrics = {
  total_violations: 127,
  open_violations: 45,
  critical_violations: 12,
  enabled_rules: 23,
  last_scan_time: new Date().toISOString(),
  violations_by_severity: {
    LOW: 35,
    MEDIUM: 52,
    HIGH: 28,
    CRITICAL: 12,
  },
  recent_violations: [],
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.get<DashboardMetrics>('/dashboard/summary');
      // return data;
      
      // Using mock data for now
      return new Promise<DashboardMetrics>((resolve) => {
        setTimeout(() => resolve(mockDashboardData), 500);
      });
    },
  });
};
