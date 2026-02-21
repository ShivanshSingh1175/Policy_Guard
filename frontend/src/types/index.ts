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

export interface Violation {
  id: string;
  scan_run_id: string;
  rule_id: string;
  rule_name: string;
  document_id: string;
  document_data: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE';
  explanation?: string;
  reviewer_note?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
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
