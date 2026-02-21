# PolicyGuard Setup Verification Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PolicyGuard Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Python
Write-Host "[1/8] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python 3\.1[1-9]") {
        Write-Host "  OK Python installed: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "  ERROR Python 3.11+ required" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "  ERROR Python not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "[2/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  OK Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Check Backend venv
Write-Host "[3/8] Checking Backend Virtual Environment..." -ForegroundColor Yellow
if (Test-Path "backend/venv/Scripts/Activate.ps1") {
    Write-Host "  OK Backend venv exists" -ForegroundColor Green
} else {
    Write-Host "  ERROR Backend venv not found" -ForegroundColor Red
    $allGood = $false
}

# Check Backend Dependencies
Write-Host "[4/8] Checking Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/venv/Lib/site-packages/fastapi") {
    Write-Host "  OK Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ERROR Backend dependencies missing" -ForegroundColor Red
    $allGood = $false
}

# Check Frontend Dependencies
Write-Host "[5/8] Checking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "  OK Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ERROR Frontend dependencies missing" -ForegroundColor Red
    $allGood = $false
}

# Check Backend .env
Write-Host "[6/8] Checking Backend Configuration..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "  OK Backend .env configured" -ForegroundColor Green
} else {
    Write-Host "  ERROR Backend .env not found" -ForegroundColor Red
    $allGood = $false
}

# Check Frontend .env
Write-Host "[7/8] Checking Frontend Configuration..." -ForegroundColor Yellow
if (Test-Path "frontend/.env") {
    Write-Host "  OK Frontend .env configured" -ForegroundColor Green
} else {
    Write-Host "  ERROR Frontend .env not found" -ForegroundColor Red
    $allGood = $false
}

# Check MongoDB
Write-Host "[8/8] Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoCheck.TcpTestSucceeded) {
        Write-Host "  OK MongoDB is running on port 27017" -ForegroundColor Green
    } else {
        Write-Host "  WARNING MongoDB not running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARNING Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "SUCCESS All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start MongoDB if not running" -ForegroundColor White
    Write-Host "2. Terminal 1: cd backend; .\venv\Scripts\Activate.ps1; python run.py" -ForegroundColor White
    Write-Host "3. Terminal 2: cd frontend; npm run dev" -ForegroundColor White
    Write-Host "4. Open: http://localhost:5173" -ForegroundColor White
} else {
    Write-Host "FAILED Some checks failed" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
