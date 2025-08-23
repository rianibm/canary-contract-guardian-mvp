#!/bin/bash

echo "🐦 Canary Contract Guardian - Frontend Integration Startup"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

echo "🔍 Checking dependencies..."

# Check if Python dependencies are installed
python3 -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing Python dependencies..."
    pip install fastapi uvicorn python-dotenv
fi

# Check if Node.js dependencies are installed
if [ ! -d "ic/src/frontend/node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    cd ic/src/frontend
    npm install
    cd ../../../
fi

echo "✅ Dependencies ready"
echo

# Start API Bridge
echo "🌉 Starting API Bridge (port 8000)..."
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Stopping existing process..."
    pkill -f "api_bridge.py" 2>/dev/null || true
    sleep 2
fi

cd fetch
python3 api_bridge.py &
API_PID=$!
cd ..

echo "⏳ Waiting for API Bridge to start..."
sleep 3

# Test API Bridge
curl -s http://127.0.0.1:8000/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API Bridge is running (PID: $API_PID)"
else
    echo "❌ API Bridge failed to start"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

echo

# Start Frontend
echo "🖥️  Starting Frontend (port 3000)..."
if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. You may need to stop the existing process."
fi

cd ic/src/frontend

echo "🚀 Starting React development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   API Bridge is running at: http://127.0.0.1:8000"
echo
echo "📝 Try these chat commands:"
echo "   • monitor this smart contract: rdmx6-jaaaa-aaaah-qcaiq-cai"
echo "   • check this smart contract for unusual activity"
echo "   • what's the status of my contracts?"
echo "   • help"
echo
echo "⏹️  To stop all services: Press Ctrl+C"
echo

# Function to cleanup when script exits
cleanup() {
    echo
    echo "🛑 Shutting down services..."
    kill $API_PID 2>/dev/null || true
    echo "✅ Cleanup complete"
}

trap cleanup EXIT

# Start frontend (this will block)
npm start

# If we reach here, npm start was stopped
cleanup
