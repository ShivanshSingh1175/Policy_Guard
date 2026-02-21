import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import { useAuth } from "./auth-context";
import {
  mockDashboardSummary,
  mockTrends,
  mockSeverityDistribution,
  mockPolicies,
  mockRules,
  mockScans,
  mockScanDetail,
  mockViolations,
  mockAccounts,
  mockAccountDetail,
  mockAlertSettings,
  mockSchedules,
  mockControlHealth,
  DEMO_USER,
} from "./mock-data";
import type {
  DashboardSummary,
  TrendPoint,
  SeverityDistribution,
  Policy,
  Rule,
  Scan,
  ScanDetail,
  Violation,
  Account,
  AccountDetail,
  AlertSettings,
  Schedule,
  ControlHealth,
  AuthResponse,
  LoginPayload,
  User,
} from "./types";

function useIsDemo() {
  const { isDemo } = useAuth();
  return isDemo;
}

// Small helper: simulate async delay for demo realism
function demoDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// ---- Auth ----
export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>("/auth/login", payload);
      return data;
    },
  });
}

export function useMe() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      if (isDemo) return demoDelay(DEMO_USER);
      const { data } = await api.get<User>("/auth/me");
      return data;
    },
    retry: false,
  });
}

// ---- Dashboard ----
export function useDashboardSummary() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockDashboardSummary);
      const { data } = await api.get<DashboardSummary>("/dashboard/summary");
      return data;
    },
  });
}

export function useDashboardTrends() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["dashboard", "trends"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockTrends);
      const { data } = await api.get<TrendPoint[]>("/dashboard/trends");
      return data;
    },
  });
}

export function useSeverityDistribution() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["dashboard", "severity"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockSeverityDistribution);
      const { data } = await api.get<SeverityDistribution[]>(
        "/dashboard/severity-distribution"
      );
      return data;
    },
  });
}

// ---- Policies ----
export function usePolicies() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockPolicies);
      const { data } = await api.get<Policy[]>("/policies");
      return data;
    },
  });
}

export function useUploadPolicy() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async (file: File) => {
      if (isDemo) {
        const newPolicy: Policy = {
          id: `pol-demo-${Date.now()}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
          status: "processing",
          rules_count: 0,
        };
        return demoDelay(newPolicy, 800);
      }
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<Policy>("/policies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useExtractRules() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async (policyId: string) => {
      if (isDemo) return demoDelay({ message: "Rules extracted", policyId }, 1200);
      const { data } = await api.post(`/policies/${policyId}/extract-rules`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
}

// ---- Rules ----
export function useRules(policyId?: string) {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["rules", policyId],
    queryFn: async () => {
      if (isDemo) {
        const filtered = policyId
          ? mockRules.filter((r) => r.policy_id === policyId)
          : mockRules;
        return demoDelay(filtered);
      }
      const params = policyId ? { policy_id: policyId } : {};
      const { data } = await api.get<Rule[]>("/rules", { params });
      return data;
    },
  });
}

export function useToggleRule() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async ({
      ruleId,
      enabled,
    }: {
      ruleId: string;
      enabled: boolean;
    }) => {
      if (isDemo) {
        const rule = mockRules.find((r) => r.id === ruleId);
        if (rule) rule.enabled = enabled;
        return demoDelay(rule as Rule, 200);
      }
      const { data } = await api.patch<Rule>(`/rules/${ruleId}`, { enabled });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rules"] }),
  });
}

// ---- Scans ----
export function useScans() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["scans"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockScans);
      const { data } = await api.get<Scan[]>("/scans");
      return data;
    },
  });
}

export function useScanDetail(scanId: string | null) {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["scans", scanId],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockScanDetail);
      const { data } = await api.get<ScanDetail>(`/scans/${scanId}`);
      return data;
    },
    enabled: !!scanId,
  });
}

export function useRunScan() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async () => {
      if (isDemo) {
        const newScan: Scan = {
          id: `scan-demo-${Date.now()}`,
          started_at: new Date().toISOString(),
          completed_at: new Date(Date.now() + 180000).toISOString(),
          duration_seconds: 180,
          status: "completed",
          total_violations: Math.floor(Math.random() * 10) + 1,
          rules_executed: 23,
        };
        return demoDelay(newScan, 1500);
      }
      const { data } = await api.post<Scan>("/scans/run");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scans"] }),
  });
}

export function useExportScan() {
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async ({
      scanId,
      format,
    }: {
      scanId: string;
      format: "csv" | "json";
    }) => {
      if (isDemo) {
        const content =
          format === "json"
            ? JSON.stringify(mockScanDetail, null, 2)
            : "rule_name,violations_found\nLarge Cash Deposit Threshold,3\nRapid Succession Transfers,1";
        const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scan-${scanId}.${format}`;
        link.click();
        return;
      }
      const { data } = await api.get(`/scans/${scanId}/export`, {
        params: { format },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `scan-${scanId}.${format}`;
      link.click();
    },
  });
}

// ---- Violations ----
export function useViolations(filters?: Record<string, string>) {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["violations", filters],
    queryFn: async () => {
      if (isDemo) {
        let filtered = [...mockViolations];
        if (filters?.severity) filtered = filtered.filter((v) => v.severity === filters.severity);
        if (filters?.status) filtered = filtered.filter((v) => v.status === filters.status);
        if (filters?.account_id) filtered = filtered.filter((v) => v.account_id === filters.account_id);
        return demoDelay(filtered);
      }
      const { data } = await api.get<Violation[]>("/violations", {
        params: filters,
      });
      return data;
    },
  });
}

export function useViolationDetail(id: string | null) {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["violations", id],
    queryFn: async () => {
      if (isDemo) {
        const v = mockViolations.find((v) => v.id === id);
        return demoDelay(v as Violation);
      }
      const { data } = await api.get<Violation>(`/violations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateViolation() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      if (isDemo) {
        const v = mockViolations.find((v) => v.id === id);
        if (v) (v as Violation).status = status as Violation["status"];
        return demoDelay(v as Violation, 400);
      }
      const { data } = await api.patch<Violation>(`/violations/${id}`, {
        status,
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["violations"] }),
  });
}

export function useRemediateViolation() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async ({
      id,
      note,
    }: {
      id: string;
      note: string;
    }) => {
      if (isDemo) {
        const v = mockViolations.find((v) => v.id === id);
        if (v) (v as Violation).status = "remediated";
        return demoDelay({ ...v, remediation_note: note }, 600);
      }
      const { data } = await api.post(`/violations/${id}/remediate`, { note });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["violations"] }),
  });
}

// ---- Accounts ----
export function useAccounts() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockAccounts);
      const { data } = await api.get<Account[]>("/accounts");
      return data;
    },
  });
}

export function useAccountDetail(id: string) {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => {
      if (isDemo) {
        const account = mockAccounts.find((a) => a.id === id || a.account_id === id);
        if (account) {
          const detail: AccountDetail = {
            ...account,
            transactions: mockAccountDetail.transactions.map((t) => ({
              ...t,
              account_id: account.account_id,
            })),
            violations: mockViolations.filter((v) => v.account_id === account.account_id),
          };
          return demoDelay(detail);
        }
        return demoDelay(mockAccountDetail);
      }
      const { data } = await api.get<AccountDetail>(`/accounts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ---- Settings ----
export function useAlertSettings() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["settings", "alerts"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockAlertSettings);
      const { data } = await api.get<AlertSettings>("/settings/alerts");
      return data;
    },
  });
}

export function useSaveAlertSettings() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async (settings: AlertSettings) => {
      if (isDemo) return demoDelay(settings, 500);
      const { data } = await api.put<AlertSettings>(
        "/settings/alerts",
        settings
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["settings", "alerts"] }),
  });
}

export function useSchedules() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["settings", "schedules"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockSchedules);
      const { data } = await api.get<Schedule[]>("/settings/schedules");
      return data;
    },
  });
}

export function useSaveSchedule() {
  const queryClient = useQueryClient();
  const isDemo = useIsDemo();
  return useMutation({
    mutationFn: async (
      schedule: Omit<Schedule, "id"> & { id?: string }
    ) => {
      if (isDemo) {
        return demoDelay({ ...schedule, id: schedule.id || `sched-demo-${Date.now()}` } as Schedule, 400);
      }
      if (schedule.id) {
        const { data } = await api.put<Schedule>(
          `/settings/schedules/${schedule.id}`,
          schedule
        );
        return data;
      }
      const { data } = await api.post<Schedule>(
        "/settings/schedules",
        schedule
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["settings", "schedules"],
      }),
  });
}

export function useControlHealth() {
  const isDemo = useIsDemo();
  return useQuery({
    queryKey: ["settings", "control-health"],
    queryFn: async () => {
      if (isDemo) return demoDelay(mockControlHealth);
      const { data } = await api.get<ControlHealth[]>(
        "/settings/control-health"
      );
      return data;
    },
  });
}
