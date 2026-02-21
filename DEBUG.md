# PolicyGuard Debugging Guide

## Quick Diagnostics

### Check Backend Status
```bash
cd backend
python -c "import sys; print(f'Python: {sys.version}')"
python -c "from app.config import settings; print('Config: OK')"
python -c "from app.main import app; print('App: OK')"
```

### Check Frontend Status
```bash
cd frontend
flutter --version
flutter pub get
flutter analyze
```

## Common Issues & Fixes

### Backend Issues

#### 1. ModuleNotFoundError: No module named 'pydantic_settings'
**Problem**: Missing Python dependencies

**Fix**:
```bash
cd backend
pip install -r requirements.txt
```

If still failing:
```bash
pip install pydantic-settings pydantic fastapi uvicorn motor python-dotenv pymupdf python-multipart httpx
```

#### 2. MongoDB Connection Error
**Problem**: MongoDB not running or wrong URI

**Fix**:
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017

# Start MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

Update `.env`:
```
MONGO_URI=mongodb://localhost:27017
```

#### 3. Import Errors
**Problem**: Python can't find app modules

**Fix**:
```bash
# Ensure you're in backend directory
cd backend

# Run from backend directory
python run.py

# Or use uvicorn directly
uvicorn app.main:app --reload
```

#### 4. Port Already in Use
**Problem**: Port 8000 is occupied

**Fix**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

#### 1. Package Not Found
**Problem**: Flutter dependencies not installed

**Fix**:
```bash
cd frontend
flutter pub get
flutter pub upgrade
```

#### 2. Riverpod Provider Error
**Problem**: Missing import in api_client.dart

**Fix**: Already fixed! The import is now:
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
```

#### 3. Build Errors
**Problem**: Cached build artifacts

**Fix**:
```bash
cd frontend
flutter clean
flutter pub get
flutter run -d chrome
```

#### 4. Chrome Not Found
**Problem**: Flutter can't find Chrome

**Fix**:
```bash
# List available devices
flutter devices

# Use specific device
flutter run -d <device-id>

# Or set Chrome path
export CHROME_EXECUTABLE=/path/to/chrome
```

#### 5. Web Port Already in Use
**Problem**: Default port occupied

**Fix**:
```bash
flutter run -d chrome --web-port=3001
```

## Testing the Setup

### 1. Backend Health Check
```bash
# Start backend
cd backend
python run.py

# In another terminal, test endpoints
curl http://localhost:8000/
curl http://localhost:8000/health

# Open API docs
# http://localhost:8000/docs
```

Expected response:
```json
{
  "service": "PolicyGuard API",
  "status": "running",
  "version": "1.0.0"
}
```

### 2. Frontend Health Check
```bash
# Start frontend
cd frontend
flutter run -d chrome

# Check browser console (F12)
# Should see: "REQUEST[GET] => PATH: /dashboard/summary"
```

### 3. Integration Test
1. Open frontend in browser
2. Navigate to Dashboard
3. Check browser DevTools Network tab
4. Should see mock data loading
5. Backend logs should show requests (if connected)

## Debugging Tools

### Backend Debugging

#### Enable Debug Logging
Edit `backend/app/config.py`:
```python
DEBUG = True
```

Run with debug:
```bash
uvicorn app.main:app --reload --log-level debug
```

#### Test Individual Endpoints
```bash
# Test policies endpoint
curl http://localhost:8000/policies

# Test with authentication (when implemented)
curl -H "Authorization: Bearer <token>" http://localhost:8000/policies
```

#### Check MongoDB Connection
```python
# In Python shell
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.policyguard
print(await db.list_collection_names())
```

### Frontend Debugging

#### Enable Verbose Logging
```bash
flutter run -d chrome --verbose
```

#### Check API Calls
Open browser DevTools (F12):
1. Network tab - see all HTTP requests
2. Console tab - see print statements
3. Application tab - check local storage

#### Test API Client
Edit `frontend/lib/core/api_client.dart` to add more logging:
```dart
print('API Response: ${response.data}');
```

## Performance Issues

### Backend Slow
1. Check MongoDB indexes (created automatically on startup)
2. Enable query profiling in MongoDB
3. Use async operations everywhere
4. Add caching for frequently accessed data

### Frontend Slow
1. Use `flutter run --profile` for profiling
2. Check for unnecessary rebuilds
3. Use `const` constructors where possible
4. Implement pagination for large lists

## Error Messages

### "Database not initialized"
**Cause**: MongoDB connection failed during startup

**Fix**:
1. Ensure MongoDB is running
2. Check MONGO_URI in .env
3. Restart backend

### "Provider not found"
**Cause**: Missing ProviderScope in Flutter app

**Fix**: Already implemented in `main.dart`:
```dart
runApp(
  const ProviderScope(
    child: PolicyGuardApp(),
  ),
);
```

### "CORS Error"
**Cause**: Frontend can't access backend due to CORS

**Fix**: Already configured in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Development Tips

### Backend
- Use `--reload` flag for auto-restart on code changes
- Check `/docs` endpoint for API documentation
- Use `print()` statements for quick debugging
- Add breakpoints in VS Code/PyCharm

### Frontend
- Hot reload: Press `r` in terminal
- Hot restart: Press `R` in terminal
- Use Flutter DevTools for widget inspection
- Check browser console for errors

## Getting Help

1. Check error messages carefully
2. Review logs in terminal
3. Test individual components
4. Verify all dependencies are installed
5. Check MongoDB is running
6. Ensure ports are available

## Verification Checklist

Before reporting issues, verify:

- [ ] Python 3.11+ installed
- [ ] Flutter 3.x installed
- [ ] MongoDB running on port 27017
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`flutter pub get`)
- [ ] Ports 8000 and 3000+ available
- [ ] No firewall blocking connections
- [ ] .env file exists in backend/
- [ ] All imports are correct

## Still Having Issues?

1. Delete and recreate virtual environment
2. Clear Flutter cache: `flutter clean`
3. Restart MongoDB
4. Check system requirements
5. Review error logs carefully
