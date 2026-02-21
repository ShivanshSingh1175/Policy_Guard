import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Rule } from '../../types';

export const useRules = (policyId?: string) => {
  return useQuery({
    queryKey: ['rules', policyId],
    queryFn: async () => {
      const params = policyId ? { policy_id: policyId } : {};
      const { data } = await apiClient.get<Rule[]>('/rules', { params });
      return data;
    },
  });
};

export const useToggleRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data } = await apiClient.patch<Rule>(`/rules/${id}`, { enabled });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};
