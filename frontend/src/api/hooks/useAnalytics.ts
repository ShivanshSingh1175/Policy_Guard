import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { ControlHealth, TopRisk } from '../../types';

export function useControlHealth() {
  return useQuery<ControlHealth[]>({
    queryKey: ['analytics', 'control-health'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/control-health');
      return response.data;
    },
  });
}

export function useTopRisks() {
  return useQuery<{ top_rules: TopRisk[]; top_accounts: TopRisk[] }>({
    queryKey: ['analytics', 'top-risks'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/top-risks');
      return response.data;
    },
  });
}

export function useFrameworkCoverage() {
  return useQuery({
    queryKey: ['analytics', 'framework-coverage'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/framework-coverage');
      return response.data;
    },
  });
}

export function useTrends(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'trends', days],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/trends?days=${days}`);
      return response.data;
    },
  });
}
