#!/bin/bash

# AMR Project Service Manager - Local Development
# This script starts all AMR services locally (without Docker)

echo "🚀 Starting AMR Project Local Services..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

# Kill any existing processes on required ports
echo "🔄 Cleaning up existing processes..."
lsof -ti:5467 | xargs kill -9 2>/dev/null || true
lsof -ti:3465 | xargs kill -9 2>/dev/null || true  
lsof -ti:12001 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

if [ ! -d "dashboard/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd dashboard && npm install && cd ..
fi

# Start API Backend
echo "🔧 Starting API Backend..."
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR
node src/start.js &
API_PID=$!
echo "   → API PID: $API_PID"

# Wait for API to start
echo "⏳ Waiting for API to initialize..."
sleep 5

# Start Agent Worker
echo "🤖 Starting Agent Worker..."
node src/agents/index.js &
WORKER_PID=$!
echo "   → Worker PID: $WORKER_PID"

# Wait for worker to start
echo "⏳ Waiting for worker to initialize..."
sleep 3

# Start Dashboard Frontend
echo "🎨 Starting Dashboard Frontend..."
cd dashboard
npm run dev &
DASHBOARD_PID=$!
echo "   → Dashboard PID: $DASHBOARD_PID"

# Wait for dashboard to start
sleep 5

echo ""
echo "🎯 Service Status:"

# Check API
if curl -s http://localhost:5467/health > /dev/null; then
    echo "   ✅ API Backend: RUNNING (http://localhost:5467)"
else
    echo "   ❌ API Backend: FAILED"
fi

# Check Dashboard
if curl -s http://localhost:3465 > /dev/null; then
    echo "   ✅ Dashboard: RUNNING (http://localhost:3465)"
else
    echo "   ❌ Dashboard: FAILED"
fi

# Check Worker
if curl -s http://localhost:12001/health > /dev/null; then
    echo "   ✅ Agent Worker: RUNNING (http://localhost:12001)"
else
    echo "   ⏳ Agent Worker: STARTING..."
fi

echo ""
echo "🌐 Access Points:"
echo "   📊 Dashboard: http://localhost:3465"
echo "   🔗 API Backend: http://localhost:5467"
echo "   🏥 Health Check: http://localhost:5467/health"
echo "   🤖 Agent Worker: http://localhost:12001/health"

echo ""
echo "📝 Process IDs:"
echo "   API: $API_PID"
echo "   Worker: $WORKER_PID" 
echo "   Dashboard: $DASHBOARD_PID"

echo ""
echo "🛑 To stop all services:"
echo "   kill $API_PID $WORKER_PID $DASHBOARD_PID"
echo "   Or run: ./stop-amr-services.sh"

echo ""
echo "📋 Useful Commands:"
echo "   API logs: tail -f logs/api-*.log"
echo "   Worker logs: check agent logs in console"
echo "   Dashboard logs: check browser console"

# Save PIDs to file for stop script
echo "$API_PID" > /tmp/amr_api.pid
echo "$WORKER_PID" > /tmp/amr_worker.pid  
echo "$DASHBOARD_PID" > /tmp/amr_dashboard.pid

echo ""
echo "✅ All AMR services are starting up!"
echo "🎉 Open http://localhost:3465 to access the dashboard"