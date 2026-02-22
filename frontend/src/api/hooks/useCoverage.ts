import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

interface DatasetRecommendation {
  id: string;
  control_id: string;
  title: string;
  description: string;
  threshold_params: Record<string, any>;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  regulatory_reference: string;
  implemented: boolean;
  mapped_rule_id?: string;
  violations_detected: number;
  accounts_affected: number;
}

interface CoverageMetrics {
  id: string;
  company_id: string;
  total_recommendations: number;
  implemented_controls: number;
  coverage_percent: number;
  last_updated_at: string;
}

export const useCoverage = () => {
  return useQuery({
    queryKey: ['coverage'],
    queryFn: async () => {
      const { data } = await apiClient.get<CoverageMetrics>('/dataset/coverage');
      return data;
    },
  });
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data } = await apiClient.get<DatasetRecommendation[]>('/dataset/recommendations');
      return data;
    },
  });
};

export const useImplementRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const { data } = await apiClient.post(`/dataset/recommendations/${recommendationId}/implement`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['coverage'] });
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

export const useImportDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/dataset/import');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['coverage'] });
    },
  });
};

export const useViolationExplanation = (violationId: string) => {
  return useQuery({
    queryKey: ['violation-explanation', violationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/violations/${violationId}/explain`);
      return data;
    },
    enabled: !!violationId,
  });
};
