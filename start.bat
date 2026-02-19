@echo off
REM Start all services for Windows

echo Starting Accessibility Audit System...

REM Start AI Service
echo Starting AI Service...
cd ai-service
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
start "AI Service" python main.py
cd ..

REM Start Backend
echo Starting Backend...
cd server
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install >nul 2>&1
)
start "Backend Server" npm start
cd ..

REM Start Frontend
echo Starting Frontend...
cd client
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install >nul 2>&1
)
start "Frontend" npm run dev
cd ..

echo.
echo Services started!
echo Access the application at: http://localhost:3000
pause
