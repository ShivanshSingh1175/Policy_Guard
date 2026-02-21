import type {
  User,
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
} from "./types";

// ---- Demo User ----
export const DEMO_USER: User = {
  id: "demo-user-001",
  email: "demo@policyguard.io",
  role: "admin",
  company_id: "comp-001",
  company_name: "Acme Financial Services",
};

export const DEMO_TOKEN = "demo-jwt-token-policyguard";

// ---- Dashboard ----
export const mockDashboardSummary: DashboardSummary = {
  total_violations: 247,
  open_violations: 38,
  high_critical_violations: 14,
  active_rules: 23,
  last_scan_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

export const mockTrends: TrendPoint[] = [
  { date: "Feb 1", count: 12 },
  { date: "Feb 3", count: 18 },
  { date: "Feb 5", count: 9 },
  { date: "Feb 7", count: 24 },
  { date: "Feb 9", count: 15 },
  { date: "Feb 11", count: 31 },
  { date: "Feb 13", count: 22 },
  { date: "Feb 15", count: 17 },
  { date: "Feb 17", count: 28 },
  { date: "Feb 19", count: 20 },
  { date: "Feb 21", count: 14 },
  { date: "Feb 22", count: 11 },
];

export const mockSeverityDistribution: SeverityDistribution[] = [
  { severity: "critical", count: 6 },
  { severity: "high", count: 8 },
  { severity: "medium", count: 14 },
  { severity: "low", count: 10 },
];

// ---- Policies ----
export const mockPolicies: Policy[] = [
  {
    id: "pol-001",
    name: "AML Customer Due Diligence",
    file_name: "aml-cdd-policy-v3.pdf",
    uploaded_at: "2026-01-15T10:30:00Z",
    status: "active",
    rules_count: 8,
  },
  {
    id: "pol-002",
    name: "Transaction Monitoring Framework",
    file_name: "txn-monitoring-framework.pdf",
    uploaded_at: "2026-01-22T14:00:00Z",
    status: "active",
    rules_count: 12,
  },
  {
    id: "pol-003",
    name: "Sanctions Screening Policy",
    file_name: "sanctions-screening-2026.pdf",
    uploaded_at: "2026-02-05T09:15:00Z",
    status: "processing",
    rules_count: 3,
  },
];

// ---- Rules ----
export const mockRules: Rule[] = [
  {
    id: "rule-001",
    policy_id: "pol-001",
    name: "Large Cash Deposit Threshold",
    description: "Flag any single cash deposit exceeding $10,000 as per BSA requirements.",
    collection: "transactions",
    severity: "high",
    enabled: true,
    pipeline: `[\n  { "$match": { "type": "cash_deposit", "amount": { "$gte": 10000 } } },\n  { "$project": { "account_id": 1, "amount": 1, "date": 1 } }\n]`,
    updated_at: "2026-02-10T08:00:00Z",
  },
  {
    id: "rule-002",
    policy_id: "pol-001",
    name: "Rapid Succession Transfers",
    description: "Detect 5+ outgoing transfers within 24 hours from same account.",
    collection: "transactions",
    severity: "critical",
    enabled: true,
    pipeline: `[\n  { "$match": { "type": "wire_transfer", "direction": "outgoing" } },\n  { "$group": { "_id": "$account_id", "count": { "$sum": 1 } } },\n  { "$match": { "count": { "$gte": 5 } } }\n]`,
    updated_at: "2026-02-10T08:00:00Z",
  },
  {
    id: "rule-003",
    policy_id: "pol-002",
    name: "Structuring Detection",
    description: "Identify series of deposits just below $10,000 that aggregate above threshold.",
    collection: "transactions",
    severity: "critical",
    enabled: true,
    pipeline: `[\n  { "$match": { "amount": { "$gte": 8000, "$lt": 10000 } } },\n  { "$group": { "_id": "$account_id", "total": { "$sum": "$amount" }, "count": { "$sum": 1 } } },\n  { "$match": { "count": { "$gte": 3 }, "total": { "$gte": 25000 } } }\n]`,
    updated_at: "2026-02-12T11:30:00Z",
  },
  {
    id: "rule-004",
    policy_id: "pol-002",
    name: "Dormant Account Activity",
    description: "Flag accounts with no activity for 12+ months that suddenly show transactions.",
    collection: "accounts",
    severity: "medium",
    enabled: true,
    pipeline: `[\n  { "$match": { "last_activity_gap_days": { "$gte": 365 } } }\n]`,
    updated_at: "2026-02-14T09:00:00Z",
  },
  {
    id: "rule-005",
    policy_id: "pol-002",
    name: "Cross-Border High Value",
    description: "Monitor international transfers exceeding $50,000.",
    collection: "transactions",
    severity: "high",
    enabled: false,
    pipeline: `[\n  { "$match": { "type": "wire_transfer", "international": true, "amount": { "$gte": 50000 } } }\n]`,
    updated_at: "2026-02-14T09:00:00Z",
  },
  {
    id: "rule-006",
    policy_id: "pol-003",
    name: "Sanctions List Match",
    description: "Screen all new customers against OFAC SDN list and other sanctions databases.",
    collection: "customers",
    severity: "critical",
    enabled: true,
    pipeline: `[\n  { "$lookup": { "from": "sanctions_list", "localField": "name", "foreignField": "name", "as": "matches" } },\n  { "$match": { "matches": { "$ne": [] } } }\n]`,
    updated_at: "2026-02-18T16:00:00Z",
  },
];

// ---- Scans ----
export const mockScans: Scan[] = [
  {
    id: "scan-001",
    started_at: "2026-02-22T06:00:00Z",
    completed_at: "2026-02-22T06:04:32Z",
    duration_seconds: 272,
    status: "completed",
    total_violations: 7,
    rules_executed: 23,
  },
  {
    id: "scan-002",
    started_at: "2026-02-21T06:00:00Z",
    completed_at: "2026-02-21T06:03:58Z",
    duration_seconds: 238,
    status: "completed",
    total_violations: 12,
    rules_executed: 23,
  },
  {
    id: "scan-003",
    started_at: "2026-02-20T06:00:00Z",
    completed_at: "2026-02-20T06:05:11Z",
    duration_seconds: 311,
    status: "completed",
    total_violations: 5,
    rules_executed: 22,
  },
  {
    id: "scan-004",
    started_at: "2026-02-19T12:30:00Z",
    completed_at: null,
    duration_seconds: null,
    status: "failed",
    total_violations: 0,
    rules_executed: 11,
  },
];

export const mockScanDetail: ScanDetail = {
  ...mockScans[0],
  rule_results: [
    { rule_id: "rule-001", rule_name: "Large Cash Deposit Threshold", violations_found: 3 },
    { rule_id: "rule-002", rule_name: "Rapid Succession Transfers", violations_found: 1 },
    { rule_id: "rule-003", rule_name: "Structuring Detection", violations_found: 2 },
    { rule_id: "rule-006", rule_name: "Sanctions List Match", violations_found: 1 },
  ],
};

// ---- Violations ----
export const mockViolations: Violation[] = [
  {
    id: "vio-001",
    rule_id: "rule-001",
    rule_name: "Large Cash Deposit Threshold",
    account_id: "ACC-10042",
    severity: "high",
    status: "open",
    created_at: "2026-02-22T06:02:14Z",
    snapshot: { amount: 14500, type: "cash_deposit", branch: "NYC-Main" },
    explanation: "Cash deposit of $14,500 exceeds the $10,000 BSA reporting threshold.",
    suggestions: ["File CTR within 15 days", "Review customer CDD profile", "Check for related deposits"],
  },
  {
    id: "vio-002",
    rule_id: "rule-002",
    rule_name: "Rapid Succession Transfers",
    account_id: "ACC-20871",
    severity: "critical",
    status: "open",
    created_at: "2026-02-22T06:02:48Z",
    snapshot: { transfer_count: 7, total_amount: 89300, period: "18 hours", destinations: ["Cayman Islands", "Luxembourg"] },
    explanation: "7 outgoing wire transfers totaling $89,300 within 18 hours. Multiple offshore destinations.",
    suggestions: ["Escalate to compliance officer", "File SAR immediately", "Freeze outgoing transfers pending review"],
  },
  {
    id: "vio-003",
    rule_id: "rule-003",
    rule_name: "Structuring Detection",
    account_id: "ACC-10042",
    severity: "critical",
    status: "confirmed",
    created_at: "2026-02-21T06:01:30Z",
    snapshot: { deposits: [9800, 9500, 9900, 9700], total: 38900, period: "5 days" },
    explanation: "Four deposits averaging $9,725 each over 5 days, totaling $38,900. Classic structuring pattern.",
    suggestions: ["File SAR with structuring indicator", "Enhanced monitoring for 90 days"],
  },
  {
    id: "vio-004",
    rule_id: "rule-004",
    rule_name: "Dormant Account Activity",
    account_id: "ACC-30156",
    severity: "medium",
    status: "open",
    created_at: "2026-02-21T06:02:05Z",
    snapshot: { dormant_days: 487, reactivation_amount: 32000, type: "wire_transfer" },
    explanation: "Account dormant for 487 days, reactivated with a $32,000 incoming wire transfer.",
    suggestions: ["Update KYC documentation", "Review source of funds"],
  },
  {
    id: "vio-005",
    rule_id: "rule-006",
    rule_name: "Sanctions List Match",
    account_id: "ACC-40023",
    severity: "critical",
    status: "open",
    created_at: "2026-02-22T06:03:10Z",
    snapshot: { matched_name: "Al-Rashid Holdings", list: "OFAC SDN", match_score: 0.94 },
    explanation: "Customer name matches OFAC SDN list entry with 94% confidence.",
    suggestions: ["Immediate account freeze", "Notify BSA officer", "File blocking report within 10 days"],
  },
  {
    id: "vio-006",
    rule_id: "rule-001",
    rule_name: "Large Cash Deposit Threshold",
    account_id: "ACC-50891",
    severity: "high",
    status: "dismissed",
    created_at: "2026-02-20T06:01:45Z",
    snapshot: { amount: 11200, type: "cash_deposit", branch: "LA-Downtown" },
    explanation: "Cash deposit of $11,200 exceeds the $10,000 BSA reporting threshold.",
    suggestions: ["File CTR within 15 days"],
  },
  {
    id: "vio-007",
    rule_id: "rule-004",
    rule_name: "Dormant Account Activity",
    account_id: "ACC-60234",
    severity: "medium",
    status: "remediated",
    created_at: "2026-02-19T06:02:30Z",
    snapshot: { dormant_days: 398, reactivation_amount: 5600, type: "ACH" },
    explanation: "Account dormant for 398 days, reactivated with ACH credit.",
    suggestions: ["Update KYC documentation"],
  },
  {
    id: "vio-008",
    rule_id: "rule-001",
    rule_name: "Large Cash Deposit Threshold",
    account_id: "ACC-70432",
    severity: "high",
    status: "open",
    created_at: "2026-02-22T06:03:55Z",
    snapshot: { amount: 25000, type: "cash_deposit", branch: "CHI-Loop" },
    explanation: "Cash deposit of $25,000 exceeds the $10,000 BSA reporting threshold.",
    suggestions: ["File CTR within 15 days", "Review for structuring patterns"],
  },
];

// ---- Accounts ----
export const mockAccounts: Account[] = [
  { id: "acc-1", account_id: "ACC-10042", customer_name: "John Meridian Corp", balance: 284500, risk_score: 87, status: "active" },
  { id: "acc-2", account_id: "ACC-20871", customer_name: "Eastbridge Trading Ltd", balance: 1245000, risk_score: 94, status: "active" },
  { id: "acc-3", account_id: "ACC-30156", customer_name: "Harmon Financial Group", balance: 67800, risk_score: 62, status: "active" },
  { id: "acc-4", account_id: "ACC-40023", customer_name: "Al-Rashid Holdings", balance: 523000, risk_score: 99, status: "frozen" },
  { id: "acc-5", account_id: "ACC-50891", customer_name: "Pacific Ventures Inc", balance: 189000, risk_score: 35, status: "active" },
  { id: "acc-6", account_id: "ACC-60234", customer_name: "Greenfield Investments", balance: 41200, risk_score: 28, status: "active" },
  { id: "acc-7", account_id: "ACC-70432", customer_name: "Sterling & Associates", balance: 892000, risk_score: 71, status: "active" },
];

export const mockAccountDetail: AccountDetail = {
  ...mockAccounts[0],
  transactions: [
    { id: "txn-1", account_id: "ACC-10042", amount: 14500, type: "cash_deposit", date: "2026-02-22T10:15:00Z", description: "Cash deposit - NYC Main Branch" },
    { id: "txn-2", account_id: "ACC-10042", amount: -5200, type: "wire_transfer", date: "2026-02-21T14:30:00Z", description: "Wire to external account" },
    { id: "txn-3", account_id: "ACC-10042", amount: 9800, type: "cash_deposit", date: "2026-02-20T09:00:00Z", description: "Cash deposit - NYC Main Branch" },
    { id: "txn-4", account_id: "ACC-10042", amount: 9500, type: "cash_deposit", date: "2026-02-18T11:20:00Z", description: "Cash deposit - NYC Midtown" },
    { id: "txn-5", account_id: "ACC-10042", amount: -3200, type: "ACH", date: "2026-02-17T08:00:00Z", description: "ACH payment - Vendor Services" },
    { id: "txn-6", account_id: "ACC-10042", amount: 9900, type: "cash_deposit", date: "2026-02-16T10:45:00Z", description: "Cash deposit - NYC Main Branch" },
  ],
  violations: mockViolations.filter((v) => v.account_id === "ACC-10042"),
};

// ---- Settings ----
export const mockAlertSettings: AlertSettings = {
  email: "compliance@acmefinancial.com",
  slack_webhook: "https://hooks.slack.com/services/T00/B00/xxxxx",
  webhook_url: "",
  min_severity: "high",
};

export const mockSchedules: Schedule[] = [
  { id: "sched-001", frequency: "Daily", interval_hours: 24, enabled: true },
  { id: "sched-002", frequency: "Hourly", interval_hours: 1, enabled: false },
];

// ---- Analytics ----
export const mockControlHealth: ControlHealth[] = [
  { rule_id: "rule-002", rule_name: "Rapid Succession Transfers", violation_count: 42, violation_rate: 0.18 },
  { rule_id: "rule-003", rule_name: "Structuring Detection", violation_count: 38, violation_rate: 0.15 },
  { rule_id: "rule-001", rule_name: "Large Cash Deposit Threshold", violation_count: 67, violation_rate: 0.12 },
  { rule_id: "rule-006", rule_name: "Sanctions List Match", violation_count: 11, violation_rate: 0.08 },
  { rule_id: "rule-004", rule_name: "Dormant Account Activity", violation_count: 29, violation_rate: 0.06 },
  { rule_id: "rule-005", rule_name: "Cross-Border High Value", violation_count: 0, violation_rate: 0 },
];
