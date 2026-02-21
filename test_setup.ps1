# PolicyGuard Setup Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PolicyGuard Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Test 1: Python
Write-Host "[1/8] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1 | Out-String
    Write-Host "  [OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Python not found" -ForegroundColor Red
    $allGood = $false
}

# Test 2: Node.js
Write-Host "[2/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1 | Out-String
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Test 3: Backend virtual environment
Write-Host "[3/8] Checking backend virtual environment..." -ForegroundColor Yellow
if (Test-Path "backend/venv") {
    Write-Host "  [OK] Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Virtual environment not found (run setup.ps1)" -ForegroundColor Red
    $allGood = $false
}

# Test 4: Backend dependencies
Write-Host "[4/8] Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/venv/Lib/site-packages/fastapi") {
    Write-Host "  [OK] FastAPI installed" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] FastAPI not installed" -ForegroundColor Red
    $allGood = $false
}

# Test 5: Backend .env file
Write-Host "[5/8] Checking backend .env file..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "  [OK] .env file exists" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] .env file not found" -ForegroundColor Red
    $allGood = $false
}

# Test 6: Frontend node_modules
Write-Host "[6/8] Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "  [OK] Node modules installed" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Node modules not installed" -ForegroundColor Red
    $allGood = $false
}

# Test 7: MongoDB connection
Write-Host "[7/8] Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("localhost", 27017)
    $tcpClient.Close()
    Write-Host "  [OK] MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] MongoDB not accessible" -ForegroundColor Yellow
}

# Test 8: Port availability
Write-Host "[8/8] Checking port availability..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue

if (-not $port8000) {
    Write-Host "  [OK] Port 8000 available" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Port 8000 in use" -ForegroundColor Yellow
}

if (-not $port5174) {
    Write-Host "  [OK] Port 5174 available" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Port 5174 in use" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick start:" -ForegroundColor Yellow
    Write-Host "1. Start MongoDB: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor White
    Write-Host "2. Start backend: cd backend; .\venv\Scripts\Activate.ps1; python run.py" -ForegroundColor White
    Write-Host "3. Import data: cd backend; .\venv\Scripts\Activate.ps1; python scripts/import_aml_data.py" -ForegroundColor White
    Write-Host "4. Start frontend: cd frontend; npm run dev" -ForegroundColor White
    Write-Host "5. Open: http://localhost:5174" -ForegroundColor White
} else {
    Write-Host "  Some checks failed - run setup.ps1 first" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
