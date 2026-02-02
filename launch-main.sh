#!/bin/bash

# AMROIS MAIN Environment Launcher
# --------------------------------
# Main Dashboard: http://localhost:3466
# Main API:       http://localhost:3467

echo "🚀 Launching AMROIS MAIN Environment..."

# Configuration
APP_DIR="/Users/andersonmartinezrestrepo/AMR"
API_PORT=3467
DASHBOARD_PORT=3466

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: Main project directory not found at $APP_DIR"
    exit 1
fi

cd "$APP_DIR" || exit

echo "📍 switched to $APP_DIR"

# Stop existing processes on these ports
echo "🧹 Cleaning up ports $API_PORT and $DASHBOARD_PORT..."
lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$DASHBOARD_PORT | xargs kill -9 2>/dev/null || true

# Start API
echo "🔌 Starting Main API on port $API_PORT..."
export PORT=$API_PORT
export DASHBOARD_PORT=$DASHBOARD_PORT
export NODE_ENV=production

nohup npm start > logs/main-api.log 2>&1 &
API_PID=$!
echo "✅ API started (PID: $API_PID)"

# Wait for API
sleep 2

# Start Dashboard
echo "🖥️  Starting Main Dashboard on port $DASHBOARD_PORT..."
cd dashboard || exit
PORT=$DASHBOARD_PORT API_URL="http://localhost:$API_PORT" nohup npm run dev > ../logs/main-dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo "✅ Dashboard started (PID: $DASHBOARD_PID)"

echo "--------------------------------------------------"
echo "🎉 AMROIS MAIN is running!"
echo "👉 Dashboard: http://localhost:$DASHBOARD_PORT"
echo "👉 API:       http://localhost:$API_PORT"
echo "--------------------------------------------------"
