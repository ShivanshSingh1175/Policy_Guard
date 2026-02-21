# PolicyGuard Quick Start

Get PolicyGuard running in 5 minutes!

## Step 1: Install Prerequisites

### Python 3.11+
```bash
python --version  # Should be 3.11 or higher
```

### Flutter 3.x
```bash
flutter --version  # Should be 3.x
```

### MongoDB
```bash
# Option 1: Docker (Recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option 2: Local installation
# Download from https://www.mongodb.com/try/download/community
```

## Step 2: Start Backend

### Windows
```bash
cd backend
run.bat
```

### Linux/Mac
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Connected to MongoDB database: policyguard
```

**Verify:** Open http://localhost:8000/docs

## Step 3: Start Frontend

### Windows
```bash
cd frontend
run.bat
```

### Linux/Mac
```bash
cd frontend
chmod +x run.sh
./run.sh
```

**Expected Output:**
```
Launching lib/main.dart on Chrome in debug mode...
```

**Verify:** Browser opens automatically with PolicyGuard dashboard

## Step 4: Test the Application

1. **Dashboard** - View metrics and recent violations
2. **Policies & Rules** - See sample policies
3. **Scans** - Configure and run scans
4. **Violations** - Review compliance violations
5. **Analytics** - View charts and trends

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version

# Install dependencies manually
cd backend
pip install fastapi uvicorn motor pydantic pydantic-settings python-dotenv pymupdf python-multipart httpx
```

### Frontend won't start
```bash
# Clean and reinstall
cd frontend
flutter clean
flutter pub get
flutter run -d chrome
```

### MongoDB connection error
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017

# If not, start it
docker start mongodb
```

### Port already in use
```bash
# Backend - use different port
uvicorn app.main:app --reload --port 8001

# Frontend - use different port
flutter run -d chrome --web-port=3001
```

## What's Next?

### 1. Explore the API
- Open http://localhost:8000/docs
- Try the interactive API documentation
- Test endpoints with sample data

### 2. Customize the Frontend
- Edit `frontend/lib/app_theme.dart` for colors
- Modify screens in `frontend/lib/features/`
- Add your own widgets

### 3. Integrate Real Backend
- Uncomment API calls in `frontend/lib/core/api_client.dart`
- Update `apiBaseUrl` in `frontend/lib/core/constants.dart`
- Test with real data

### 4. Implement LLM Integration
- Edit `backend/app/services/llm_service.py`
- Add your LLM API key to `.env`
- Test rule generation

### 5. Add Sample Data
```python
# In Python shell
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.policyguard

# Add sample transaction
await db.transactions.insert_one({
    "amount": 15000,
    "sender": "Account_123",
    "receiver": "Account_456",
    "documentation_status": "incomplete"
})
```

## Project Structure

```
PolicyGuard/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Entry point
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── models/      # Data models
│   └── run.py           # Dev server
│
├── frontend/            # Flutter frontend
│   ├── lib/
│   │   ├── main.dart    # Entry point
│   │   ├── core/        # API client, constants
│   │   └── features/    # Screens & widgets
│   └── run.bat/sh       # Dev server
│
├── README.md            # Project overview
├── SETUP.md             # Detailed setup
├── DEBUG.md             # Debugging guide
└── QUICKSTART.md        # This file
```

## Key Files to Know

### Backend
- `app/main.py` - FastAPI app setup
- `app/routes/` - API endpoints
- `app/services/llm_service.py` - LLM integration (TODO)
- `app/config.py` - Configuration
- `.env` - Environment variables

### Frontend
- `lib/main.dart` - App entry point
- `lib/core/api_client.dart` - HTTP client
- `lib/features/dashboard/` - Dashboard screen
- `lib/app_theme.dart` - Theme configuration

## Common Commands

### Backend
```bash
# Start server
python run.py

# Run with custom port
uvicorn app.main:app --reload --port 8001

# Check syntax
python -m py_compile app/main.py
```

### Frontend
```bash
# Start app
flutter run -d chrome

# Hot reload
# Press 'r' in terminal

# Clean build
flutter clean && flutter pub get
```

## Need Help?

- **Setup Issues**: See [SETUP.md](SETUP.md)
- **Debugging**: See [DEBUG.md](DEBUG.md)
- **API Docs**: http://localhost:8000/docs
- **Project Info**: See [README.md](README.md)

## Success Indicators

✅ Backend running on http://localhost:8000
✅ Frontend opens in Chrome
✅ Dashboard shows metrics
✅ No errors in terminal
✅ API docs accessible at /docs

You're all set! Start building your compliance system! 🚀
