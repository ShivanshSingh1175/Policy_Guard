import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

interface ImportResult {
  rows_processed: number;
  rows_inserted: number;
  rows_failed: number;
  sample_errors: string[];
}

interface DataStats {
  transactions: number;
  accounts: number;
  payroll: number;
}

export const useImportTransactions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post<ImportResult>('/data/import/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useImportAccounts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post<ImportResult>('/data/import/accounts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataStats'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useImportPayroll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post<ImportResult>('/data/import/payroll', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataStats'] });
    },
  });
};

export const useDataStats = () => {
  return useQuery({
    queryKey: ['dataStats'],
    queryFn: async () => {
      const { data } = await apiClient.get<DataStats>('/data/stats');
      return data;
    },
  });
};
