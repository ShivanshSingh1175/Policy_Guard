import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface Account {
    _id: string;
    account_id: string;
    account_type: string;
    balance: number;
    status: string;
    risk_score: number;
}

export interface AccountRiskScore {
    account_id: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    risk_score: number;
    violation_count: number;
    high_severity_count: number;
    medium_severity_count: number;
    low_severity_count: number;
    calculated_at: string;
}

export interface AccountDetail {
    account_id: string;
    account_type: string;
    balance: number;
    status: string;
    risk_score: AccountRiskScore;
    recent_violations: Array<{
        id: string;
        rule_name: string;
        severity: string;
        created_at: string;
    }>;
    transaction_count: number;
}

export function useAccounts() {
    return useQuery<Account[]>({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await apiClient.get('/accounts');
            return response.data;
        },
    });
}

export function useAccountDetail(accountId: string | null) {
    return useQuery<AccountDetail>({
        queryKey: ['accounts', accountId],
        queryFn: async () => {
            const response = await apiClient.get(`/accounts/${accountId}`);
            return response.data;
        },
        enabled: !!accountId,
    });
}
