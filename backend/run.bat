@echo off
REM Backend development server runner for Windows

echo Starting PolicyGuard Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Run the server
echo.
echo Starting FastAPI server...
python run.py
