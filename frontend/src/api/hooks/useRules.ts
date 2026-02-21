import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiClient } from '../client';
import type { Rule } from '../../types';

// Mock data
const mockRules: Rule[] = [
  {
    id: '1',
    name: 'Large Cash Transactions',
    description: 'Detect cash transactions over $10,000',
    policy_id: '1',
    policy_name: 'AML Transaction Monitoring Policy',
    collection: 'transactions',
    query: { amount: { $gt: 10000 }, transaction_type: 'CASH' },
    severity: 'HIGH',
    enabled: true,
    created_at: '2024-01-15T10:35:00Z',
    updated_at: '2024-01-15T10:35:00Z',
  },
  {
    id: '2',
    name: 'Structuring Detection',
    description: 'Multiple transactions just below reporting threshold',
    policy_id: '1',
    policy_name: 'AML Transaction Monitoring Policy',
    collection: 'transactions',
    severity: 'CRITICAL',
    enabled: true,
    created_at: '2024-01-15T10:36:00Z',
    updated_at: '2024-01-15T10:36:00Z',
  },
  {
    id: '3',
    name: 'Dormant Account Activity',
    description: 'Sudden activity in dormant accounts',
    policy_id: '1',
    collection: 'accounts',
    query: { last_activity_days: { $gt: 180 }, recent_transaction_count: { $gt: 5 } },
    severity: 'MEDIUM',
    enabled: false,
    created_at: '2024-01-15T10:37:00Z',
    updated_at: '2024-01-15T10:37:00Z',
  },
];

export const useRules = (policyId?: string) => {
  return useQuery({
    queryKey: ['rules', policyId],
    queryFn: async () => {
      // TODO: Replace with real API call
      // const params = policyId ? { policy_id: policyId } : {};
      // const { data } = await apiClient.get<Rule[]>('/rules', { params });
      // return data;
      
      return new Promise<Rule[]>((resolve) => {
        setTimeout(() => {
          const filtered = policyId 
            ? mockRules.filter(r => r.policy_id === policyId)
            : mockRules;
          resolve(filtered);
        }, 300);
      });
    },
  });
};

export const useToggleRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.patch<Rule>(`/rules/${id}`, { enabled });
      // return data;
      
      return new Promise<Rule>((resolve) => {
        setTimeout(() => {
          const rule = mockRules.find(r => r.id === id);
          if (rule) {
            resolve({ ...rule, enabled });
          }
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};
