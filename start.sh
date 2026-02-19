#!/bin/bash

# Start all services for Harmonized Accessibility Audit System

echo "Starting Accessibility Audit System..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Warning: MongoDB doesn't appear to be running"
    echo "Please start MongoDB: mongod"
fi

# Start AI Service
echo "Starting AI Service..."
cd ai-service
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python main.py &
AI_PID=$!
cd ..

# Start Backend
echo "Starting Backend..."
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install > /dev/null 2>&1
fi
npm start &
SERVER_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd client
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Services started!"
echo "AI Service PID: $AI_PID"
echo "Backend PID: $SERVER_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $AI_PID $SERVER_PID $FRONTEND_PID; exit" INT TERM
wait
