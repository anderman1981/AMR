#!/bin/bash

# AMROIS DEV Environment Launcher
# -------------------------------
# DEV Dashboard: http://localhost:3465
# DEV API:       http://localhost:3464 (Assigned)

echo "🚀 Launching AMROIS DEV Environment..."

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_PORT=3464
DASHBOARD_PORT=3465

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: Dev project directory not found at $APP_DIR"
    exit 1
fi

cd "$APP_DIR" || exit

echo "📍 switched to $APP_DIR"

# Stop existing processes on these ports
echo "🧹 Cleaning up ports $API_PORT and $DASHBOARD_PORT..."
lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$DASHBOARD_PORT | xargs kill -9 2>/dev/null || true

# Start API
echo "🔌 Starting DEV API on port $API_PORT..."
export PORT=$API_PORT
export DASHBOARD_PORT=$DASHBOARD_PORT
export NODE_ENV=development

nohup npm run dev > logs/dev-api.log 2>&1 &
API_PID=$!
echo "✅ API started (PID: $API_PID)"

# Wait for API
sleep 2

# Start Dashboard
echo "🖥️  Starting DEV Dashboard on port $DASHBOARD_PORT..."
cd dashboard || exit
PORT=$DASHBOARD_PORT API_URL="http://localhost:$API_PORT" nohup npm run dev > ../logs/dev-dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo "✅ Dashboard started (PID: $DASHBOARD_PID)"

echo "--------------------------------------------------"
echo "🎉 AMROIS DEV is running!"
echo "👉 Dashboard: http://localhost:$DASHBOARD_PORT"
echo "👉 API:       http://localhost:$API_PORT"
echo "--------------------------------------------------"
