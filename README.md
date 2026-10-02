# PolicyGuard

**AI-Powered AML Compliance & Transaction Monitoring Platform**

PolicyGuard is an enterprise-grade Anti-Money Laundering (AML) compliance platform that transforms policy documents into executable monitoring rules, combines machine learning anomaly detection with deterministic rule enforcement, and provides complete investigation workflow for financial crime prevention.

---

## 🎯 What PolicyGuard Does

- **Policy-to-Rule Translation**: Upload compliance policy PDFs and automatically generate executable MongoDB rules using Google Gemini AI
- **ML Anomaly Detection**: Unsupervised Isolation Forest model with 14 behavioral features for transaction anomaly detection
- **Hybrid Risk Scoring**: Combines policy rules (40%), ML predictions (30%), and AML patterns (30%) into unified risk scores
- **AML Pattern Detection**: Structuring, rapid transfers, unusual frequency, round amounts, high-risk accounts, daily structuring
- **Complete Investigation Workflow**: Violations → Cases → Audit Trail with multi-user assignment and evidence tracking
- **Multi-Tenant SaaS**: Complete company isolation with role-based access control

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
         ↓
FastAPI Backend
         ↓
JWT Authentication + RBAC
         ↓
MongoDB (Tenant-Isolated)
         ↓
┌────────┴────────┐
│                  │
Policy Engine    Transaction Data
│                  │
Rule Generator   Feature Engineering
│                  │
Rule Executor ←── ML Model (Isolation Forest)
│                  │
└────────┬─────────┘
         ↓
   AML Patterns + Hybrid Risk Engine
         ↓
     Violations
         ↓
       Cases
         ↓
    Analytics
```

**Key Flow:**
1. **Policy Upload** → PDF text extraction → Gemini AI → Rules generated → Stored in MongoDB
2. **Transaction Import** → CSV validation → Stored with company_id → Ready for scanning
3. **Scan Execution** → Rule evaluation + AML patterns + ML prediction → Violations created
4. **Risk Calculation** → Hybrid engine combines scores → Risk level assigned (LOW/MEDIUM/HIGH/CRITICAL)
5. **Investigation** → Violations → Cases → Investigator assignment → Resolution

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB (Motor 3.6.0 async driver)
- **Authentication**: Argon2 + JWT
- **AI/LLM**: Google Gemini (google-generativeai 0.3.2)
- **ML**: scikit-learn 1.3.2, pandas 2.1.4, numpy 1.26.2
- **PDF Processing**: PyMuPDF 1.23.8
- **Testing**: pytest 7.4.3, pytest-asyncio 0.21.1

### Frontend
- **Framework**: React 19.2.0 + TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **UI Library**: Material-UI 6.5.0
- **Routing**: React Router 7.13.0
- **State Management**: TanStack Query 5.90.21
- **Charts**: Recharts 3.7.0
- **HTTP Client**: Axios 1.13.5

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Deployment**: Railway, Vercel
- **Database**: MongoDB Atlas (production)

---

## 📁 Repository Structure

```
policy_guard/
├── README.md                    # This file
├── SECURITY.md                  # Security policies
├── LICENSE                      # License
├── docker-compose.yml           # Docker setup
├── verify_setup.ps1             # Prerequisites check
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # System architecture
│   ├── API.md                   # API endpoints
│   ├── ML_PIPELINE.md           # ML documentation
│   ├── TESTING.md               # Testing guide
│   ├── DEPLOYMENT.md            # Deployment guide
│   ├── TROUBLESHOOTING.md       # Common issues
│   └── FINAL_DIAGNOSTIC_REPORT.md
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── routes/              # API endpoints
│   │   ├── models/              # Pydantic models
│   │   ├── services/            # Business logic
│   │   ├── ml/                  # ML pipeline
│   │   ├── config.py            # Configuration
│   │   ├── db.py                # Database connection
│   │   └── main.py              # FastAPI app
│   │
│   ├── tests/                   # Automated tests
│   │   ├── test_security.py
│   │   ├── test_integration.py
│   │   ├── test_ml.py
│   │   └── test_risk_engine.py
│   │
│   ├── scripts/                 # Utility scripts
│   │   ├── seed_demo_data.py
│   │   └── generate_synthetic_data.py
│   │
│   ├── sample_data/             # Sample CSV files
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   ├── pytest.ini               # Pytest configuration
│   ├── Dockerfile               # Docker image
│   ├── railway.json             # Railway config
│   └── run.py                   # Server startup
│
└── frontend/                    # React frontend
    ├── src/
    │   ├── features/            # Feature modules
    │   ├── components/          # Reusable components
    │   ├── services/            # API clients
    │   ├── hooks/               # Custom hooks
    │   └── config/              # Configuration
    │
    ├── package.json             # Node dependencies
    ├── .env.example             # Environment template
    ├── vite.config.ts           # Vite configuration
    └── tsconfig.json            # TypeScript config
```

---

## ⚡ Quick Start

### Prerequisites

**Required:**
- Python 3.11+
- Node.js 18+ and npm
- MongoDB 4.4+ (local or MongoDB Atlas)
- Git

**Optional:**
- Docker Desktop (for containerized setup)

**Verify Prerequisites:**
```powershell
.\verify_setup.ps1
```

---

### 1. Clone Repository

```powershell
git clone <repository-url>
cd policy_guard
```

---

### 2. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install -r requirements.txt

# Verify installation
python -m pip check
```

---

### 3. Environment Configuration

#### Backend Environment

```powershell
# Copy example to .env
cp .env.example .env
```

Edit `backend/.env`:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=policyguard

# JWT Authentication (REQUIRED: Generate secure secret)
JWT_SECRET_KEY=<your-secure-random-secret-32-chars-minimum>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Google Gemini API (REQUIRED for rule generation)
GEMINI_API_KEY=<your-gemini-api-key>
LLM_MODEL=gemini-pro
LLM_TEMPERATURE=0.7

# Application Configuration
APP_ENV=development
DEBUG=true

# CORS (add frontend URL)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Generate JWT Secret:**
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Get Gemini API Key:**
Visit https://makersuite.google.com/app/apikey

#### Frontend Environment

```powershell
cd ../frontend

# Copy example to .env
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Firebase (Optional - only if using Firebase auth)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

---

### 4. MongoDB Setup

#### Option A: Local MongoDB (Development)

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs as a Windows service automatically
4. Verify: `mongosh` in terminal

**Verify Connection:**
```powershell
cd backend
python -c "from app.db import connect_to_mongo; import asyncio; asyncio.run(connect_to_mongo())"
```

#### Option B: MongoDB Atlas (Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Add your IP to whitelist
4. Get connection string
5. Update `MONGO_URI` in `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

---

### 5. Start Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```

**Backend runs at:** http://localhost:8000
**API Documentation:** http://localhost:8000/docs
**Health Check:** http://localhost:8000/health

---

### 6. Start Frontend

```powershell
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

### 7. Seed Demo Data (Optional)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python scripts/seed_demo_data.py
```

**Demo Login:**
- Email: `demo@amlbank.com`
- Password: `demo12345`

---

## 🧪 Testing

### Run All Tests

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pytest -v
```

**Expected Result:** 22/22 tests passing

### Test Categories

- **Security Tests (7)**: Authentication, authorization, input validation
- **Integration Tests (2)**: Tenant isolation, feature extraction pipeline
- **ML Tests (7)**: Feature engineering, model training, prediction, persistence
- **Risk Engine Tests (6)**: Hybrid scoring, risk level calculation

### Run Specific Test Suite

```powershell
# Security only
python -m pytest tests/test_security.py -v

# ML only
python -m pytest tests/test_ml.py -v

# Integration only
python -m pytest tests/test_integration.py -v
```

---

## 🎯 End-to-End Testing

### Manual E2E Test Flow

1. **Register Company**
   - Navigate to http://localhost:5173
   - Click "Register" → Create company account

2. **Login**
   - Use credentials to login
   - Verify dashboard loads

3. **Import Transactions**
   - Navigate to "Data Import"
   - Upload `backend/sample_data/sample_transactions.csv`
   - Verify import success

4. **Upload Policy**
   - Navigate to "Policies"
   - Upload PDF policy document
   - Click "Extract Rules"
   - Verify rules generated

5. **Run Scan**
   - Navigate to "Scans"
   - Click "Run Scan"
   - Wait for completion
   - Verify violations created

6. **Review Violations**
   - Navigate to "Violations"
   - Verify risk scores (rule + ML + AML)
   - Check violation details

7. **Create Case**
   - Select violation(s)
   - Click "Create Case"
   - Assign to investigator
   - Add notes

8. **View Analytics**
   - Navigate to "Analytics"
   - Verify charts and metrics

### Automated E2E Script

```powershell
cd backend
python test_e2e.py
```

**Note:** Requires backend running at http://localhost:8000

---

## 🤖 ML Pipeline

### Training

The ML model is trained per-company using historical transaction data.

**Train Model:**
```powershell
# Via API (authenticated)
POST /ml/train
{
  "model_version": "v1"
}
```

**Algorithm:** Isolation Forest (unsupervised anomaly detection)

**Features (14):**
1. `amount` - Transaction amount
2. `hour_of_day` - Time pattern (0-23)
3. `day_of_week` - Day pattern (0-6)
4. `is_weekend` - Weekend flag
5. `is_cash` - Cash transaction flag
6. `is_wire` - Wire transfer flag
7. `is_international` - International flag
8. `near_threshold` - Close to $10K
9. `exact_10k` - Exactly $10K (structuring indicator)
10. `amount_rounded` - Round number pattern
11. `account_age_days` - Account age
12. `transaction_frequency` - Historical frequency
13. `avg_amount` - Average amount
14. `unusual_amount` - Deviation from average

**Model Storage:** MongoDB (binary joblib format per company)

### Inference

During scan execution:
1. Latest model loaded for company
2. Features extracted from transaction
3. Anomaly score generated (-1 to 1)
4. Score converted to 0-100 risk score
5. Combined with rule + AML scores

---

## 🔐 Security

### Authentication
- Argon2 password hashing
- JWT token-based authentication
- 24-hour token expiration (configurable)

### Authorization
- Role-based access control (RBAC)
- Protected endpoints require valid Bearer token
- User roles: Admin, Manager, Investigator, Analyst

### Tenant Isolation
- **Critical:** All queries filter by `company_id`
- Company ID extracted from JWT token
- 35+ enforcement points verified
- Integration tests confirm isolation

### Input Security
- Pydantic schema validation
- File type and size validation
- MongoDB ObjectId format validation
- NoSQL injection prevention

**See [SECURITY.md](SECURITY.md) for complete security documentation.**

---

## 📖 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and data flow
- **[API.md](docs/API.md)** - API endpoints and usage
- **[ML_PIPELINE.md](docs/ML_PIPELINE.md)** - Machine learning pipeline
- **[TESTING.md](docs/TESTING.md)** - Testing guide
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🚨 Troubleshooting

### Python Not Found
```powershell
# Add Python to PATH or use full path
py -m venv venv
```

### MongoDB Connection Failed
```powershell
# Verify MongoDB is running
mongosh

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017
```

### Port Already in Use
```powershell
# Backend (8000)
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Frontend (5173)
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

### Environment Variables Not Loading
- Verify `.env` file exists (not `.env.example`)
- Check file is in correct directory (backend/ or frontend/)
- Restart server after changing `.env`

### Pytest Failures
```powershell
# Verify MongoDB is running
# Check all dependencies installed
python -m pip check

# Run with verbose output
python -m pytest -v --tb=short
```

### Frontend Build Errors
```powershell
# Clear cache and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

**See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more solutions.**

---

## 🚀 Production Deployment

### Environment Variables Required

**Backend:**
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET_KEY` - Secure random secret (32+ chars)
- `GEMINI_API_KEY` - Google Gemini API key
- `CORS_ORIGINS` - Production frontend URL
- `APP_ENV=production`
- `DEBUG=false`

**Frontend:**
- `VITE_API_URL` - Production backend URL

### Railway Deployment (Backend)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

Railway automatically detects `railway.json` configuration.

### Vercel Deployment (Frontend)

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

Vercel automatically detects `vercel.json` configuration.

**See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.**

---

## 📊 Project Status

- ✅ **Backend**: Fully implemented and tested (22/22 tests passing)
- ✅ **Frontend**: Production build successful
- ✅ **Security**: Verified (authentication, authorization, tenant isolation)
- ✅ **ML Pipeline**: Operational (Isolation Forest with 14 features)
- ✅ **AML Patterns**: 6 patterns implemented
- ✅ **Hybrid Risk Engine**: Validated
- ✅ **Database**: MongoDB with tenant isolation
- ⚠️ **Production Ready**: Requires environment configuration

**External Requirements:**
1. Generate and set `JWT_SECRET_KEY`
2. Obtain and set `GEMINI_API_KEY`
3. Configure production MongoDB (MongoDB Atlas)
4. Set production `CORS_ORIGINS`

---

## 📄 License

See [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Enhanced error handling and logging
- Rate limiting on authentication endpoints
- Comprehensive audit logging
- Advanced monitoring and alerting
- Load testing and performance optimization
- Security audit and penetration testing

---

## 📧 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review [API.md](docs/API.md) for endpoint details
3. Check automated tests for examples
4. Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design

---

**PolicyGuard** - AI-Powered AML Compliance Platform
