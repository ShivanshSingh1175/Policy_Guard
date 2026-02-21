# PolicyGuard Setup Guide

Complete setup instructions for both backend and frontend.

## Prerequisites

- Python 3.11+
- Flutter 3.x
- MongoDB (local or remote)
- Node.js (optional, for additional tools)

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Update MONGO_URI if using remote MongoDB
```

### 5. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use your existing MongoDB instance
```

### 6. Run the backend
```bash
uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install Flutter dependencies
```bash
flutter pub get
```

### 3. Run the frontend
```bash
# For web
flutter run -d chrome

# For specific port
flutter run -d chrome --web-port=3000
```

Frontend will open in Chrome automatically.

## Troubleshooting

### Backend Issues

**ModuleNotFoundError: No module named 'pydantic_settings'**
```bash
pip install pydantic-settings
```

**MongoDB connection error**
- Ensure MongoDB is running on port 27017
- Check MONGO_URI in .env file
- Test connection: `mongosh mongodb://localhost:27017`

**Import errors**
```bash
# Reinstall all dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Package not found**
```bash
flutter pub get
flutter pub upgrade
```

**Build errors**
```bash
flutter clean
flutter pub get
flutter run -d chrome
```

**Riverpod errors**
- Ensure flutter_riverpod is in pubspec.yaml
- Run `flutter pub get`

## Testing the Setup

### 1. Test Backend
```bash
# Check health endpoint
curl http://localhost:8000/health

# View API docs
# Open http://localhost:8000/docs in browser
```

### 2. Test Frontend
- Open the app in Chrome
- Navigate through Dashboard, Policies, Scans, Violations
- Check browser console for errors (F12)

### 3. Test Integration
- Frontend should display mock data
- Check Network tab in browser DevTools
- API calls will show in backend logs

## Development Workflow

### Backend Development
```bash
# Run with auto-reload
uvicorn app.main:app --reload --log-level debug

# Run tests (when implemented)
pytest

# Format code
black app/
isort app/
```

### Frontend Development
```bash
# Run with hot reload
flutter run -d chrome

# Analyze code
flutter analyze

# Format code
dart format lib/
```

## Production Deployment

### Backend
```bash
# Install production dependencies
pip install -r requirements.txt

# Set environment
export APP_ENV=production

# Run with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
# Build for production
flutter build web --release

# Output in build/web/
# Deploy to hosting service (Firebase, Netlify, etc.)
```

## Next Steps

1. **Backend**: Implement actual LLM integration in `app/services/llm_service.py`
2. **Frontend**: Uncomment API calls in `lib/core/api_client.dart`
3. **Database**: Populate MongoDB with sample AML data
4. **Testing**: Add unit and integration tests
5. **Security**: Implement authentication and authorization
6. **Monitoring**: Add logging and error tracking

## Common Commands

### Backend
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Check Python version
python --version

# List installed packages
pip list
```

### Frontend
```bash
# Check Flutter version
flutter --version

# List devices
flutter devices

# Run on specific device
flutter run -d chrome

# Build for web
flutter build web

# Clean build artifacts
flutter clean
```

## Support

For issues:
1. Check logs in terminal
2. Review error messages
3. Check MongoDB connection
4. Verify all dependencies are installed
5. Ensure ports 8000 (backend) and 3000+ (frontend) are available
