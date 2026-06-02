@echo off
echo ========================================================
echo Startup Insight AI - Full-Stack Local Launcher
echo ========================================================
echo.

REM 1. Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python to run the backend API server.
    pause
    exit /b
)

REM 2. Check Node installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not added to PATH.
    echo Please install Node.js to run the frontend client.
    pause
    exit /b
)

echo [INFO] Starting Backend API service on http://localhost:8000...
start "Startup Insight AI - Backend API" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

echo [INFO] Starting Frontend Dev server on http://localhost:3000...
start "Startup Insight AI - Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo [SUCCESS] Both servers are starting up in separate windows!
echo - API Server: http://localhost:8000
echo - Web App: http://localhost:3000
echo ========================================================
echo.
pause
