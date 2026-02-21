export interface Policy {
  id: string;
  name: string;
  description?: string;
  version?: string;
  source?: string;
  extracted_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Rule {
  id: string;
  name: string;
  description?: string;
  policy_id?: string;
  policy_name?: string;
  collection: string;
  query?: Record<string, any>;
  aggregation?: any[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
  framework?: string;
  control_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ScanRun {
  id: string;
  started_at: string;
  completed_at?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  rules_checked: number;
  violations_found: number;
  duration_seconds?: number;
  collections?: string[];
}

export interface ViolationComment {
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface Violation {
  id: string;
  scan_run_id: string;
  rule_id: string;
  rule_name: string;
  collection: string;
  document_id: string;
  document_data: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE';
  explanation?: string;
  reviewer_note?: string;
  reviewed_by?: string;
  assigned_to_user_id?: string;
  assigned_to_user_name?: string;
  comments?: ViolationComment[];
  created_at: string;
  updated_at: string;
}

export interface CaseComment {
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface Case {
  id: string;
  company_id: string;
  title: string;
  primary_account_id?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_REVIEW' | 'CLOSED';
  assigned_to_user_id?: string;
  assigned_to_user_name?: string;
  linked_violation_ids: string[];
  comments: CaseComment[];
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name: string;
}

export interface ControlHealth {
  rule_id: string;
  rule_name: string;
  framework: string;
  control_id?: string;
  severity: string;
  total_scans: number;
  total_violations: number;
  last_seen_at?: string;
  average_violations_per_scan: number;
  enabled: boolean;
}

export interface TopRisk {
  rule_id?: string;
  rule_name?: string;
  account_id?: string;
  account_name?: string;
  violation_count: number;
  critical_count: number;
  high_count: number;
  risk_score?: number;
}

export interface DashboardMetrics {
  total_violations: number;
  open_violations: number;
  critical_violations: number;
  enabled_rules: number;
  last_scan_time?: string;
  violations_by_severity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recent_violations: Violation[];
}
