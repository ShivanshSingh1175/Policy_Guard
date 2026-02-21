# PolicyGuard

**Multi-Tenant Compliance Co-Pilot for Operational Risk Management**

PolicyGuard is an AI-powered, multi-tenant compliance platform that transforms static PDF policies into executable monitoring rules, continuously scans transactional data for violations, and provides a complete workflow for remediation, risk scoring, and audit-ready evidence generation.

Unlike traditional policy Q&A bots or BRD generators, PolicyGuard is an **operational compliance tool** that runs rules on live data, manages violations through their lifecycle, and assists compliance teams with actionable insights and automated workflows.

---

## 🎯 What Makes PolicyGuard Unique

PolicyGuard stands out from typical policy/BRD agents by focusing on **operational compliance**:

1. **Runs Rules on Live Data**: Executes MongoDB aggregation pipelines on real transactional datasets (IBM AML), not just answering questions about policies
2. **Multi-Tenant Architecture**: Complete company isolation with role-based access (Admin, Compliance Officer, Auditor)
3. **Violation Workflow**: Full lifecycle management (Open → Confirmed → Dismissed) with remediation suggestions and audit trails
4. **Risk Scoring & Alerts**: Account-level risk computation, real-time alerts via email/Slack for high-severity violations
5. **Audit-Ready Evidence**: Scan runs store rule versions, timestamps, and violation snapshots; exportable as CSV/JSON audit packs
6. **Continuous Monitoring**: Scheduled scans with control health metrics, not one-time document analysis

---

## 🏗️ Tech Stack (FARM + RAG)

- **Backend**: FastAPI + Uvicorn + Motor (async MongoDB driver)
- **Frontend**: React 18 + TypeScript + Vite + React Router + TanStack Query + Material-UI + Recharts
- **Database**: MongoDB (multi-tenant collections with `company_id` scoping)
- **AI/LLM**: Google Gemini API for policy-to-rule extraction (RAG-ready architecture)
- **Auth**: JWT with role-based access control (RBAC)
- **Dataset**: IBM AML transaction data from GDG Hackfest 2.0

---

## ✨ Feature Summary

### A) Core Features (Implemented ✔)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1 | **Secure Login & Roles** | ✔ | Multi-tenant company registration, JWT auth, 3 roles (Admin/Compliance Officer/Auditor) |
| 2 | **Dashboard** | ✔ | Real-time metrics, violation trends (line chart), severity distribution (bar chart), recent violations table |
| 3 | **Policy & Rule Management** | ✔ | Upload PDF policies, LLM extracts MongoDB rules, enable/disable rules per company |
| 4 | **Scans & Scheduling** | ✔ | Manual scan execution, scheduled scans (cron-like), scan history with duration/violations count |
| 5 | **Violations Workflow** | ✔ | Filter by rule/severity/status/date, update status (Open/Confirmed/Dismissed), add notes |
| 6 | **Account Risk Scoring** | ✔ | Weighted risk score (High=3, Med=2, Low=1), risk badges (Low/Med/High/Critical), violation history |

### B) Smart Compliance Features (Implemented/Planned)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 7 | **Smart Remediation** | ✔ | LLM suggests 1-3 remediation actions per violation (e.g., "Request additional KYC docs") |
| 8 | **Real-Time Alerts** | ✔ | Email/Slack webhooks trigger on high-severity violations, configurable per company |
| 9 | **Impact Analysis** | ✔ | Simulate rule changes on historical data (e.g., "What if threshold was $5K instead of $10K?") |
| 10 | **Audit Packs** | ✔ | Export scan runs as CSV/JSON with rule versions, timestamps, violation snapshots |
| 11 | **Multi-Policy Framework** | ☐ | Roadmap: Support multiple policy sets (AML, KYC, Sanctions) with dataset switching |

---

## 🔐 Multi-Tenancy & Authentication

### Company-Based Isolation
- Every collection includes `company_id` field
- All queries automatically scoped by JWT `company_id`
- Companies register with first admin user
- Users belong to one company, cannot access other companies' data

### Roles & Permissions
- **Admin**: Full access (manage users, policies, rules, scans, settings)
- **Compliance Officer**: Review violations, run scans, view reports
- **Auditor**: Read-only access to violations, scans, and audit trails

### JWT Token Structure
```json
{
  "sub": "user_id",
  "company_id": "company_id",
  "role": "ADMIN",
  "email": "user@company.com",
  "exp": 1234567890
}
```

---

## 🗄️ Backend Architecture

### MongoDB Collections (All Multi-Tenant)

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `companies` | Company profiles | `name`, `industry`, `created_at` |
| `users` | User accounts | `company_id`, `email`, `password_hash`, `role` |
| `policies` | Uploaded PDF policies | `company_id`, `name`, `file_path`, `text_content`, `embeddings` |
| `rules` | Extracted compliance rules | `company_id`, `policy_id`, `name`, `collection`, `pipeline`, `severity`, `enabled` |
| `scan_runs` | Scan execution history | `company_id`, `started_at`, `duration`, `status`, `rule_results[]` |
| `violations` | Detected violations | `company_id`, `scan_run_id`, `rule_id`, `severity`, `status`, `document_data`, `remediation_suggestions[]` |
| `accounts` | Account master data | `company_id`, `account_id`, `account_type`, `balance`, `status` |
| `transactions` | Transaction data (IBM AML) | `company_id`, `transaction_id`, `amount`, `src_account`, `dst_account`, `timestamp` |
| `alert_configs` | Alert settings | `company_id`, `channel` (email/slack), `webhook_url`, `min_severity` |
| `scan_schedules` | Scheduled scans | `company_id`, `frequency`, `interval_hours`, `collections[]`, `rule_ids[]` |

### API Endpoints (30+)

#### Authentication
- `POST /auth/register-company` - Register new company + admin user
- `POST /auth/login` - Login with email/password, returns JWT
- `GET /auth/me` - Get current user info

#### Dashboard
- `GET /dashboard/summary` - Metrics (total/open/critical violations, enabled rules)

#### Policies & Rules
- `POST /policies` - Upload PDF policy
- `GET /policies` - List company policies
- `GET /policies/{id}` - Get policy details
- `POST /policies/{id}/extract-rules` - LLM extracts rules from policy text
- `GET /rules` - List all rules (filterable by policy, enabled status)
- `GET /rules/{id}` - Get rule details
- `PATCH /rules/{id}` - Update rule (enable/disable, edit pipeline)
- `POST /rules/{id}/simulate` - Impact analysis (run on historical data)

#### Scans
- `POST /scans/run` - Execute manual scan
- `GET /scans` - List scan history
- `GET /scans/{id}` - Get scan details
- `GET /scans/{id}/export` - Export audit pack (CSV/JSON)

#### Violations
- `GET /violations` - List violations (filters: rule, severity, status, date range)
- `GET /violations/{id}` - Get violation details
- `PATCH /violations/{id}` - Update status, add notes
- `POST /violations/{id}/remediate` - Log remediation action

#### Accounts
- `GET /accounts/{id}` - Get account details + risk score + violations

#### Settings
- `POST /settings/alerts` - Create alert config
- `GET /settings/alerts` - List alert configs
- `POST /settings/schedules` - Create scan schedule
- `GET /settings/schedules` - List scan schedules
- `GET /settings/control-health` - Get rule health metrics (last run, violation rate)

---

## 🎨 Frontend Architecture

### Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Company login with email/password |
| `/app/dashboard` | DashboardPage | Metrics cards, charts (violations trend, severity distribution), recent violations table |
| `/app/policies` | PoliciesPage | Upload PDFs, list policies, generate rules button |
| `/app/rules` | RulesPage | List rules, enable/disable toggle, view MongoDB pipeline, simulate impact |
| `/app/scans` | ScansPage | Run manual scan, view history, schedule scans, export audit packs |
| `/app/violations` | ViolationsPage | Filter violations, detail drawer with remediation suggestions, status updates |
| `/app/accounts` | AccountsPage | Search accounts, view risk score badge, violation history |
| `/app/analytics` | AnalyticsPage | Trend analysis, control effectiveness, risk heatmaps |
| `/app/settings` | SettingsPage | Company info, user role, alert config (email/Slack), scan schedules |

### Key Components

- **MetricCard**: Animated cards with gradient text, hover effects, trend indicators
- **ViolationDetailDrawer**: Shows violation snapshot, suggested remediation, status workflow
- **RiskScoreBadge**: Color-coded badge (Low=green, Med=yellow, High=orange, Critical=red)
- **ScanHistoryTable**: Sortable table with duration, violations count, export button
- **RuleSimulator**: Input new threshold, run on last N days, show impact diff

### State Management
- **TanStack Query** for API calls (caching, loading states, error handling)
- **React Router** for protected routes (JWT check)
- **Axios interceptor** for automatic JWT attachment + 401 handling

---

## 📊 Dataset Usage (IBM AML)

PolicyGuard uses the **IBM AML (Anti-Money Laundering) dataset** from GDG Hackfest 2.0:

- **1000 transactions**: Wire, Cash, Check, ACH, Card transactions with amounts, timestamps, src/dst accounts
- **100 accounts**: Account master data with balances, types, statuses
- **3 example rules**: Large cash transactions ($10K+), structuring detection, high-risk account patterns

### Sample Rule (Large Cash Transactions)
```json
{
  "name": "Large Cash Transactions",
  "collection": "transactions",
  "pipeline": [
    { "$match": { "transaction_type": "CASH", "amount": { "$gte": 10000 } } },
    { "$project": { "transaction_id": 1, "amount": 1, "timestamp": 1 } }
  ],
  "severity": "HIGH",
  "explanation": "Cash transactions over $10,000 require CTR filing"
}
```

---

## 🧠 Smart Compliance Features

### 1. Smart Remediation Suggestions
When a violation is detected, PolicyGuard's LLM generates 1-3 actionable remediation steps:

**Example (Large Cash Transaction)**:
1. Request additional KYC documentation from customer
2. File Currency Transaction Report (CTR) with FinCEN
3. Review customer's transaction history for patterns

**Implementation**: `POST /violations/{id}/remediate` logs chosen action + notes

### 2. Real-Time Alerts
Configurable alerts trigger on high-severity violations:

- **Email**: SMTP integration with customizable templates
- **Slack**: Webhook integration with rich message formatting
- **Webhook**: Generic HTTP POST for custom integrations

**Configuration**: `POST /settings/alerts` with `min_severity`, `channel`, `recipients`

### 3. Impact Analysis
Simulate rule changes before deployment:

**Example**: "What if we lower the large transaction threshold from $10K to $5K?"

```bash
POST /rules/{rule_id}/simulate
{
  "modified_pipeline": [...],  # Updated threshold
  "lookback_days": 30
}
```

**Response**: Shows additional violations that would be detected, helping assess operational impact

### 4. Audit Packs & Evidence
Every scan run stores:
- Rule versions (pipeline snapshots)
- Execution timestamps
- Violation document snapshots (immutable)
- User actions (status changes, notes)

**Export**: `GET /scans/{id}/export?format=csv` generates audit-ready report

---

## 🚀 How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 4.4+ (local or Docker)
- Google Gemini API key (for LLM features)

### 1. Setup (Automated)

```powershell
# Run setup script (creates venv, installs dependencies)
.\setup.ps1

# Verify setup
.\test_setup.ps1
```

### 2. Start MongoDB

```powershell
# Option A: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Local MongoDB service
net start MongoDB
```

### 3. Configure Environment

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=policyguard
JWT_SECRET_KEY=your-secret-key-change-in-production
GEMINI_API_KEY=AIzaSyCt0mvrqZyqMbWgv1_ce0sIUyB-IjwYWNA
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 4. Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```

Backend runs on **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Import Sample Data

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python scripts/import_aml_data.py
```

This creates:
- 1000 sample transactions
- 100 sample accounts
- 3 example compliance rules

### 6. Start Frontend

```powershell
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🎬 Demo Script (End-to-End)

### Step 1: Register Company
1. Open http://localhost:8000/docs
2. Execute `POST /auth/register-company`:
```json
{
  "name": "Demo Financial Corp",
  "industry": "Financial Services",
  "admin_email": "admin@democorp.com",
  "admin_password": "password123",
  "admin_name": "Jane Admin"
}
```
3. Copy the returned `access_token`

### Step 2: Login to Frontend
1. Open http://localhost:5173/login
2. Enter:
   - Email: `admin@democorp.com`
   - Password: `password123`
3. Click "Sign In"

### Step 3: View Dashboard
- See metrics: Total Violations, Open Violations, Critical Issues, Active Rules
- View charts: Violations Trend (last 7 days), Violations by Severity
- Check recent violations table

### Step 4: Upload Policy (Optional)
1. Go to **Policies** page
2. Click "Upload Policy"
3. Upload any PDF (e.g., sample AML policy)
4. Click "Generate Rules" to extract rules via LLM

### Step 5: Run Compliance Scan
1. Go to **Scans** page
2. Click "Run Scan Now"
3. Select collections: `transactions`, `accounts`
4. Select rules: All enabled rules
5. Click "Execute Scan"
6. Wait for scan to complete (~5-10 seconds)

### Step 6: Review Violations
1. Go to **Violations** page
2. See detected violations (e.g., "Large Cash Transactions")
3. Click on a violation to open detail drawer
4. View:
   - Violation snapshot (transaction details)
   - Suggested remediation actions
   - Status workflow (Open → Confirmed → Dismissed)
5. Update status to "Confirmed"
6. Add notes: "Reviewed with compliance team, filing CTR"

### Step 7: Check Account Risk Score
1. Go to **Accounts** page
2. Search for an account (e.g., `ACC0001`)
3. View:
   - Risk score badge (Low/Med/High/Critical)
   - Weighted risk score (0-100)
   - Recent violations list
   - Transaction count

### Step 8: Configure Alerts
1. Go to **Settings** page
2. Click "Add Alert Config"
3. Configure:
   - Channel: Email or Slack
   - Min Severity: HIGH
   - Recipients/Webhook URL
4. Save config

### Step 9: Export Audit Pack
1. Go to **Scans** page
2. Find completed scan
3. Click "Export" button
4. Download CSV/JSON audit pack with:
   - Scan metadata (timestamp, duration)
   - Rule versions
   - Violation snapshots
   - Audit trail

---

## 🔄 Continuous Monitoring Workflow

PolicyGuard enables continuous compliance monitoring:

```
1. Upload Policy PDF
   ↓
2. LLM Extracts Rules (MongoDB pipelines)
   ↓
3. Enable Rules for Company
   ↓
4. Schedule Scans (hourly/daily/weekly)
   ↓
5. Scan Executes on Live Data
   ↓
6. Violations Detected & Stored
   ↓
7. Alerts Sent (Email/Slack)
   ↓
8. Compliance Team Reviews
   ↓
9. Remediation Actions Logged
   ↓
10. Audit Pack Generated
```

---

## 🛠️ Troubleshooting

### Backend won't start
```powershell
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Check MongoDB connection
python -c "from pymongo import MongoClient; client = MongoClient('mongodb://localhost:27017'); print('Connected:', client.server_info()['version'])"
```

### Frontend shows blank screen
```powershell
# Check browser console (F12) for errors
# Verify API URL in frontend/.env
# Reinstall dependencies
cd frontend
npm install
npm run dev
```

### Login fails
- Check JWT_SECRET_KEY in backend/.env
- Verify user was created (check MongoDB `users` collection)
- Check backend logs for errors

### Scans don't detect violations
- Verify rules are enabled (`GET /rules`)
- Check rule pipelines are valid MongoDB aggregations
- Ensure sample data was imported (`python scripts/import_aml_data.py`)

---

## 📈 Roadmap

### Phase 1 (Current - Hackfest 2.0)
- ✔ Multi-tenant architecture
- ✔ Policy-to-rule extraction (LLM)
- ✔ Violation workflow & remediation
- ✔ Risk scoring & alerts
- ✔ Audit packs

### Phase 2 (Post-Hackfest)
- ☐ Multi-policy support (AML + KYC + Sanctions)
- ☐ Real-time streaming (Kafka/Redis)
- ☐ Advanced RAG (vector search for policy Q&A)
- ☐ ML-based anomaly detection
- ☐ Mobile app (React Native)

### Phase 3 (Production)
- ☐ SSO integration (SAML, OAuth)
- ☐ Advanced RBAC (custom roles)
- ☐ Workflow automation (auto-remediation)
- ☐ Regulatory reporting (SAR, CTR auto-filing)
- ☐ Multi-region deployment

---

## 🏆 Why PolicyGuard Wins

PolicyGuard is not just another policy chatbot or BRD generator. It's a **complete operational compliance platform** that:

1. **Executes Rules on Real Data**: Runs MongoDB aggregations on live transactions, not just document Q&A
2. **Manages Full Lifecycle**: Violations go through Open → Confirmed → Dismissed with audit trails
3. **Assists, Doesn't Replace**: Provides remediation suggestions and alerts, but keeps humans in the loop
4. **Multi-Tenant from Day 1**: Built for SaaS deployment with complete company isolation
5. **Audit-Ready**: Every action logged, every scan versioned, every violation immutable

**PolicyGuard = Policy Intelligence + Operational Monitoring + Workflow Automation**

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This project was built for GDG Hackfest 2.0. Contributions welcome!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📧 Contact

For questions or demo requests, contact the PolicyGuard team.

**Built with ❤️ for GDG Hackfest 2.0**
