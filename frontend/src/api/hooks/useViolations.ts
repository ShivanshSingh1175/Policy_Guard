import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiClient } from '../client';
import type { Violation } from '../../types';

// Mock data
const mockViolations: Violation[] = [
  {
    id: '1',
    scan_run_id: 'scan_1',
    rule_id: '1',
    rule_name: 'Large Cash Transactions',
    document_id: 'txn_12345',
    document_data: {
      transaction_id: 'txn_12345',
      amount: 15000,
      transaction_type: 'CASH',
      sender_account: 'ACC001',
      receiver_account: 'ACC002',
    },
    severity: 'HIGH',
    status: 'OPEN',
    explanation: 'Cash transaction exceeds $10,000 threshold without proper documentation',
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: '2',
    scan_run_id: 'scan_1',
    rule_id: '2',
    rule_name: 'Structuring Detection',
    document_id: 'acc_67890',
    document_data: {
      account_id: 'acc_67890',
      transaction_count: 5,
      total_amount: 48000,
    },
    severity: 'CRITICAL',
    status: 'OPEN',
    explanation: 'Multiple transactions just below $10,000 threshold detected',
    created_at: '2024-02-20T14:35:00Z',
    updated_at: '2024-02-20T14:35:00Z',
  },
];

interface ViolationFilters {
  rule_id?: string;
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const useViolations = (filters?: ViolationFilters) => {
  return useQuery({
    queryKey: ['violations', filters],
    queryFn: async () => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.get<Violation[]>('/violations', { params: filters });
      // return data;
      
      return new Promise<Violation[]>((resolve) => {
        setTimeout(() => {
          let filtered = [...mockViolations];
          
          if (filters?.severity) {
            filtered = filtered.filter(v => v.severity === filters.severity);
          }
          if (filters?.status) {
            filtered = filtered.filter(v => v.status === filters.status);
          }
          if (filters?.rule_id) {
            filtered = filtered.filter(v => v.rule_id === filters.rule_id);
          }
          
          resolve(filtered);
        }, 300);
      });
    },
  });
};

export const useUpdateViolation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      reviewer_note 
    }: { 
      id: string; 
      status: Violation['status']; 
      reviewer_note?: string;
    }) => {
      // TODO: Replace with real API call
      // const { data } = await apiClient.patch<Violation>(`/violations/${id}`, {
      //   status,
      //   reviewer_note,
      // });
      // return data;
      
      return new Promise<Violation>((resolve) => {
        setTimeout(() => {
          const violation = mockViolations.find(v => v.id === id);
          if (violation) {
            resolve({ 
              ...violation, 
              status, 
              reviewer_note,
              updated_at: new Date().toISOString(),
            });
          }
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
