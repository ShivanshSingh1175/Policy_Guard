# PolicyGuard

**Continuous controls monitoring + AML case platform that turns policy PDFs into live MongoDB rules and shows real impact on your data in minutes.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)

**Built for GDG Hackfest 2.0** | **Dataset: IBM AML Transaction Data**

---

## 🎯 The Problem

Traditional compliance tools are either:
- **Document Q&A bots** that answer questions but don't execute rules
- **Static policy managers** that store PDFs without operational value  
- **Manual review systems** requiring analysts to check every transaction

**Result:** Compliance teams spend weeks manually translating policies into code, then months investigating violations across disconnected systems.

## 💡 The PolicyGuard Solution

PolicyGuard is the **only hackathon project** that combines:

1. ✅ **AI Policy-to-Rule Translation** - Gemini transforms PDF policies into executable MongoDB aggregation pipelines
2. ✅ **Live Data Execution** - Rules run on real transactional data, not mock responses
3. ✅ **Impact Simulation** - See how many violations a policy would catch BEFORE deploying
4. ✅ **Enterprise Case Workflow** - Full investigation lifecycle from detection → case → remediation → audit
5. ✅ **Multi-Tenant SaaS Architecture** - Production-ready with company isolation and RBAC
6. ✅ **My Work Dashboard** - Personal task management for assigned cases and violations
7. ✅ **Rule Tuning Simulator** - What-if analysis to optimize thresholds before deployment
8. ✅ **Webhook Integrations** - Connect to Slack, email, or custom systems
9. ✅ **Guided Demo** - Interactive walkthrough of the entire compliance workflow

**Architecture Flow:**
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Policy PDF │─────▶│   Gemini    │─────▶│ MongoDB     │─────▶│ Violations  │
│  (Upload)   │      │  (Extract)  │      │  Rules      │      │  (Detected) │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                                                  │                      │
                                                  ▼                      ▼
                                           ┌─────────────┐      ┌─────────────┐
                                           │   Scans     │      │    Cases    │
                                           │  (Execute)  │      │ (Investigate)│
                                           └─────────────┘      └─────────────┘
                                                  │                      │
                                                  ▼                      ▼
                                           ┌─────────────┐      ┌─────────────┐
                                           │  Analytics  │      │ Audit Packs │
                                           │ (Insights)  │      │  (Evidence) │
                                           └─────────────┘      └─────────────┘
```

---

## 🚀 Why PolicyGuard Stands Out

### vs. Other Hackfest Projects

| Feature | PolicyGuard | Typical Projects |
|---------|-------------|------------------|
| **Executes on Real Data** | ✅ MongoDB pipelines on 1000+ transactions | ❌ Mock responses or Q&A only |
| **Policy Impact Preview** | ✅ Shows violations BEFORE deploying rules | ❌ No impact analysis |
| **Rule Tuning Simulator** | ✅ What-if analysis with before/after counts | ❌ No simulation capability |
| **Enterprise Case Management** | ✅ Full workflow with SLA tracking | ❌ Basic violation lists |
| **My Work Dashboard** | ✅ Personal task management | ❌ No user-specific views |
| **Multi-Tenant Architecture** | ✅ Production-ready SaaS with company isolation | ❌ Single-user demos |
| **Webhook Integrations** | ✅ Connect to Slack, email, custom systems | ❌ No external integrations |
| **Guided Demo** | ✅ Interactive 7-step walkthrough | ❌ No onboarding |
| **Audit Trail** | ✅ Immutable activity logs | ❌ No audit capability |
| **CSV Data Import** | ✅ Upload your own data | ❌ Fixed demo data only |

---

## ✨ Key Features

### Core Compliance Platform
- ✅ **Multi-Tenant Authentication** - Company registration, JWT auth, 3 user roles (Admin, Compliance Officer, Auditor)
- ✅ **Dashboard** - Real-time metrics, violation trends, severity distribution
- ✅ **Policy Management** - Upload PDFs, LLM extracts MongoDB rules with auto-scan
- ✅ **Rule Engine** - Enable/disable rules, simulate impact, framework mapping
- ✅ **Compliance Scans** - Manual/scheduled execution, scan history
- ✅ **Violation Workflow** - Filter, review, update status, add notes, assign to users
- ✅ **Account Risk Scoring** - Weighted risk calculation, violation history

### Advanced Features (What Makes Us Different)
- ✅ **Policy Impact Analysis** - Auto-scan shows violations caught by new rules with top accounts/rules
- ✅ **Rule Tuning Simulator** - Test threshold changes before deployment (violations before vs after)
- ✅ **My Work Page** - Personal dashboard showing assigned cases and violations with SLA status
- ✅ **Case Management** - Create cases from violations, link multiple violations, SLA tracking (L1/L2/QA levels)
- ✅ **Activity Timeline** - Full audit trail of all status changes, assignments, comments
- ✅ **Control Health Analytics** - Rule performance metrics, average violations per scan
- ✅ **Top Risks Dashboard** - Top 5 risky rules and accounts by violation count
- ✅ **Framework/Control Mapping** - AML-CTR-01, AML-STR-01, AML-HR-01 control IDs
- ✅ **CSV Data Import** - Upload transactions, accounts, payroll data
- ✅ **Webhook Integrations** - Configure webhooks for high-severity violations and case closures
- ✅ **Guided Demo** - Interactive 7-step walkthrough of the entire platform
- ✅ **Collaboration** - Comments and assignments on violations and cases

---

## 🏗️ Tech Stack (FARM + AI)

- **Backend**: FastAPI + Uvicorn + Motor (async MongoDB)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI + TanStack Query + Recharts
- **Database**: MongoDB (multi-tenant with `company_id` scoping)
- **AI/LLM**: Google Gemini API for policy-to-rule extraction
- **Auth**: JWT with role-based access control (Admin, Compliance Officer, Auditor)
- **Dataset**: IBM AML transaction data (1000 transactions, 100 accounts)

---

## 📊 Demo Flow (Guided Experience)

PolicyGuard includes an interactive **Guided Demo** button that walks you through:

1. **Login** - Use demo credentials: `demo@amlbank.com` / `demo12345`
2. **Upload Policy PDF** - Upload an AML compliance policy
3. **Extract Rules with Auto-Scan** - AI generates rules and immediately shows impact
4. **View Policy Impact** - See "This policy would have caught X violations (breakdown by severity)"
5. **Review Violations** - Filter, assign, add comments
6. **Create Case** - Link related violations into investigation cases
7. **Check My Work** - View your assigned tasks with SLA status
8. **Simulate Rule Changes** - Test threshold adjustments before deployment
9. **Export Audit Pack** - Generate compliance evidence

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Python 3.11+
- Node.js 18+
- MongoDB 4.4+
- Google Gemini API key
```

### 1️⃣ Clone Repository

```bash
git clone https://github.com/ShivanshSingh1175/Policy_Guard.git
cd Policy_Guard
```

### 2️⃣ Setup Backend

```powershell
# Run automated setup
.\setup.ps1

# Or manual setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Configure Environment** (`backend/.env`):
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=policyguard
JWT_SECRET_KEY=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 3️⃣ Start MongoDB

```powershell
# Option A: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Local service
net start MongoDB
```

### 4️⃣ Seed Demo Data

```powershell
cd backend
python scripts/seed_demo_data.py
```

This creates:
- Demo company: "AML Demo Bank"
- Demo user: `demo@amlbank.com` / `demo12345`
- 100 accounts, 1000 transactions
- 2 policies, 4 rules, 158 violations, 2 cases

### 5️⃣ Start Backend

```powershell
cd backend
python run.py
```

Backend runs at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 6️⃣ Setup Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 7️⃣ Access Application

1. Open `http://localhost:5173`
2. Login with: `demo@amlbank.com` / `demo12345`
3. Click the **Guided Demo** button (compass icon) in the top right
4. Follow the 7-step interactive walkthrough

---

## 📤 Company Data Import

Upload your own data via CSV files:

### Transactions CSV
```csv
date,amount,from_account,to_account,type,currency,channel
2024-01-15,15000,ACC001,ACC002,WIRE,USD,ONLINE
```

### Accounts CSV
```csv
account_id,customer_id,customer_name,country,risk_score,segment
ACC001,CUST001,John Doe,US,45,RETAIL
```

### Payroll CSV
```csv
employee_id,name,salary,department,bank_account,pay_date
EMP001,Alice Johnson,75000,Engineering,ACC123,2024-01-31
```

**Import via:** Settings → Data Import → Select CSV file

---

## 🎯 Unique Features Explained

### 1. Policy Impact Analysis

When you extract rules from a policy PDF with auto-scan enabled:

```json
{
  "rules_created": 5,
  "scan_summary": {
    "total_violations": 23,
    "high": 8,
    "medium": 12,
    "low": 3,
    "top_rules": [
      {"rule_name": "Large Cash Transactions", "count": 12},
      {"rule_name": "Structuring Detection", "count": 8}
    ],
    "top_accounts": [
      {"account_id": "ACC042", "count": 5},
      {"account_id": "ACC089", "count": 4}
    ]
  }
}
```

**Why it matters:** See the real impact of a policy BEFORE deploying it to production.

### 2. Rule Tuning Simulator

Test threshold changes before deployment:

```bash
POST /rules/{rule_id}/simulate
{
  "proposed_query": {
    "transaction_type": "CASH",
    "amount": { "$gte": 5000 }  # Changed from $10,000
  }
}
```

**Response:**
```json
{
  "violations_before": 12,
  "violations_after": 28,
  "change": +16,
  "change_percent": 133.3
}
```

**Why it matters:** Optimize thresholds without creating noise or missing violations.

### 3. My Work Dashboard

Personal task management showing:
- Cases assigned to you with SLA status (ON_TRACK, AT_RISK, BREACHED)
- Violations assigned to you
- Critical items requiring immediate attention
- Progress tracking

**Why it matters:** Compliance officers know exactly what needs their attention.

### 4. Enterprise Case Management

- Link multiple violations into investigation cases
- SLA tracking with due dates
- Investigation levels (L1, L2, QA)
- Activity timeline showing all changes
- Comments and collaboration

**Why it matters:** Handle complex investigations spanning multiple violations.

---

## 🔧 API Endpoints (50+)

### Authentication
- `POST /auth/register-company` - Register company + admin
- `POST /auth/login` - Login with email/password

### Policies & Rules
- `POST /policies/upload` - Upload PDF policy
- `POST /policies/{id}/extract-rules?auto_scan=true` - Extract rules with impact analysis
- `GET /rules` - List rules with filters
- `POST /rules/{id}/simulate` - Simulate rule changes

### Scans & Violations
- `POST /scans/run` - Execute compliance scan
- `GET /violations` - List violations with filters
- `PATCH /violations/{id}/assign` - Assign to user

### Cases
- `POST /cases` - Create case from violations
- `GET /cases` - List cases with SLA status
- `POST /cases/{id}/comment` - Add comment

### My Work
- `GET /my-work/cases` - Get assigned cases
- `GET /my-work/violations` - Get assigned violations

### Data Import
- `POST /data/import/transactions` - Import transactions CSV
- `POST /data/import/accounts` - Import accounts CSV
- `POST /data/import/payroll` - Import payroll CSV

### Analytics
- `GET /analytics/control-health` - Rule performance metrics
- `GET /analytics/top-risks` - Top 5 rules and accounts

---

## 🎨 UI/UX Highlights

- **Dark Mode Theme** - Professional deep blue palette (#2872A1)
- **Smooth Animations** - Card hover effects, page transitions
- **Skeleton Loaders** - Professional loading states
- **Empty States** - Helpful guidance when no data
- **Guided Demo** - Interactive 7-step walkthrough
- **Responsive Design** - Works on desktop and tablet
- **Severity Colors** - Consistent color coding (GREEN=LOW, AMBER=MEDIUM, ORANGE=HIGH, RED=CRITICAL)

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
Real-time metrics, violation trends, and severity distribution

### Policy Impact Analysis
![Policy Impact](docs/screenshots/policy-impact.png)
See violations caught by new rules before deployment

### My Work
![My Work](docs/screenshots/my-work.png)
Personal task dashboard with SLA tracking

### Rule Tuning Simulator
![Rule Tuning](docs/screenshots/rule-tuning.png)
What-if analysis for threshold optimization

### Case Management
![Cases](docs/screenshots/cases.png)
Enterprise investigation workflow with activity timeline

---

## 🏆 What Makes This Production-Ready

1. **Multi-Tenancy** - Complete company isolation with `company_id` scoping
2. **RBAC** - Role-based access control (Admin, Compliance Officer, Auditor)
3. **JWT Authentication** - Secure token-based auth
4. **Error Handling** - Comprehensive error boundaries and user-friendly messages
5. **Audit Trail** - Immutable activity logs for compliance
6. **Data Validation** - Pydantic models with strict validation
7. **API Documentation** - Auto-generated Swagger/OpenAPI docs
8. **Type Safety** - Full TypeScript coverage on frontend
9. **Responsive Design** - Works across devices
10. **Performance** - Async MongoDB queries, React Query caching

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 👥 Team

Built by **Shivansh Singh** for GDG Hackfest 2.0

---

## 🙏 Acknowledgments

- **GDG Hackfest 2.0** for the opportunity
- **IBM AML Dataset** for realistic transaction data
- **Google Gemini** for AI-powered rule extraction
- **FastAPI** and **React** communities for excellent frameworks

---

**PolicyGuard** - Continuous controls monitoring + AML case platform that turns policy PDFs into live MongoDB rules and shows real impact on your data in minutes.
