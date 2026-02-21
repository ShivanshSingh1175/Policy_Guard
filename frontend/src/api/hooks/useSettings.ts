import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface AlertConfig {
    id: string;
    channel: 'EMAIL' | 'SLACK' | 'WEBHOOK';
    enabled: boolean;
    email_recipients?: string[];
    slack_webhook_url?: string;
    webhook_url?: string;
    min_severity: string;
}

export interface ScanSchedule {
    id: string;
    name: string;
    description?: string;
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
    interval_hours?: number;
    collections: string[];
    rule_ids: string[];
    enabled: boolean;
    last_run?: string;
    next_run?: string;
}

export function useAlertConfigs() {
    return useQuery<AlertConfig[]>({
        queryKey: ['settings', 'alerts'],
        queryFn: async () => {
            const response = await apiClient.get('/settings/alerts');
            return response.data;
        },
    });
}

export function useScanSchedules() {
    return useQuery<ScanSchedule[]>({
        queryKey: ['settings', 'schedules'],
        queryFn: async () => {
            const response = await apiClient.get('/settings/schedules');
            return response.data;
        },
    });
}

export function useCreateAlertConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<AlertConfig, 'id'>) => {
            const response = await apiClient.post('/settings/alerts', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'alerts'] });
        },
    });
}

export function useCreateScanSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<ScanSchedule, 'id'>) => {
            const response = await apiClient.post('/settings/schedules', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'schedules'] });
        },
    });
}
