// PolicyGuard API types

export interface User {
  id: string;
  email: string;
  role: string;
  company_id: string;
  company_name: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface DashboardSummary {
  total_violations: number;
  open_violations: number;
  high_critical_violations: number;
  active_rules: number;
  last_scan_time: string | null;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface SeverityDistribution {
  severity: string;
  count: number;
}

export interface Policy {
  id: string;
  name: string;
  file_name: string;
  uploaded_at: string;
  status: string;
  rules_count: number;
}

export interface Rule {
  id: string;
  policy_id: string;
  name: string;
  description: string;
  collection: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  pipeline: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  status: "running" | "completed" | "failed";
  total_violations: number;
  rules_executed: number;
}

export interface ScanDetail extends Scan {
  rule_results: Array<{
    rule_id: string;
    rule_name: string;
    violations_found: number;
  }>;
}

export type ViolationSeverity = "low" | "medium" | "high" | "critical";
export type ViolationStatus = "open" | "confirmed" | "dismissed" | "remediated";

export interface Violation {
  id: string;
  rule_id: string;
  rule_name: string;
  account_id: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  created_at: string;
  snapshot: Record<string, unknown>;
  explanation: string;
  suggestions: string[];
}

export interface Account {
  id: string;
  account_id: string;
  customer_name: string;
  balance: number;
  risk_score: number;
  status: string;
}

export interface AccountDetail extends Account {
  transactions: Transaction[];
  violations: Violation[];
}

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  type: string;
  date: string;
  description: string;
}

export interface AlertSettings {
  email: string;
  slack_webhook: string;
  webhook_url: string;
  min_severity: ViolationSeverity;
}

export interface Schedule {
  id: string;
  frequency: string;
  interval_hours: number;
  enabled: boolean;
}

export interface ControlHealth {
  rule_id: string;
  rule_name: string;
  violation_count: number;
  violation_rate: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
